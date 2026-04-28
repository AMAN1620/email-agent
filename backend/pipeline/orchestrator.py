import json

from core.logging import get_logger
from core.openai_client import get_openai_client
from core.retry import openai_retry
from agents.tools import TOOLS, dispatch_tool
from gmail_client.modifier import mark_email_read
from pipeline.idempotency import try_claim, mark_done, mark_failed
from models.schemas import EmailRecord
from config import OPENAI_MODEL

logger = get_logger(__name__)

ORCHESTRATOR_PROMPT = """You are an email analysis agent. Analyze the email and call the appropriate tool(s):

- extract_lead: sender is a potential customer, prospect, or inquiring about products/services
- extract_invoice: email contains an invoice, bill, or payment request with vendor + amounts
- extract_transaction: email confirms a completed payment, bank debit, or financial transaction

Rules:
- Call multiple tools if an email matches multiple categories.
- If none match, call no tools.
- Extract only what is explicitly stated — do not guess missing fields.
- For Indian emails: currency is INR unless stated otherwise."""


def _format_email(email: EmailRecord) -> str:
    return f"From: {email.sender}\nSubject: {email.subject}\n\n{email.body[:4000]}"


@openai_retry
async def _call_openai(email: EmailRecord) -> list:
    response = await get_openai_client().chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": ORCHESTRATOR_PROMPT},
            {"role": "user", "content": _format_email(email)},
        ],
        tools=TOOLS,
        tool_choice="auto",
    )
    return response.choices[0].message.tool_calls or []

async def classify_and_route(email: EmailRecord) -> str | None:
    """
    Claim → call OpenAI with tools → dispatch → mark read → mark done.
    Returns the processing status: 'processed', 'skipped', or 'failed'.
    """
    claimed = await try_claim(
        email.message_id,
        sender=email.sender,
        subject=email.subject,
        body=email.body,
        received_at=email.received_at,
    )
    if not claimed:
        logger.info("Email already claimed or done, skipping", message_id=email.message_id)
        return "skipped"

    try:
        tool_calls = await _call_openai(email)
        types = []

        for tc in tool_calls:
            try:
                args = json.loads(tc.function.arguments)
                label = await dispatch_tool(tc.function.name, args, email)
                types.append(label)
                logger.info("Tool dispatched", tool=tc.function.name, message_id=email.message_id)
            except Exception as e:
                logger.error("Tool dispatch failed", tool=tc.function.name,
                             message_id=email.message_id, error=str(e))

        if not types:
            types = ["unknown"]

        await mark_email_read(email.message_id)
        await mark_done(email.message_id, types)
        logger.info("Email processed", message_id=email.message_id, types=types)
        return "processed"

    except Exception as e:
        await mark_failed(email.message_id, str(e))
        logger.error("Email processing failed", message_id=email.message_id, error=str(e))
        return "failed"

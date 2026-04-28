from models.schemas import EmailRecord, Lead, Invoice, InvoiceLineItem, Transaction
from db.repositories import save_lead, save_invoice, save_transaction

# ── OpenAI tool definitions ────────────────────────────────────────────────
# Parameters are defined inline (not from model_json_schema) to avoid
# $ref / $defs that OpenAI's function tool parser doesn't support.

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "extract_lead",
            "description": (
                "Call this when the email is from a potential customer, prospect, "
                "or someone inquiring about products or services."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Full name of the sender or main contact"},
                    "company": {"type": "string", "description": "Company name, or empty string"},
                    "email": {"type": "string", "description": "Email address"},
                    "phone": {"type": "string", "description": "Phone number, or empty string"},
                    "intent": {"type": "string", "description": "Brief description of what they want"},
                    "source": {"type": "string", "description": "How they found us, or empty string"},
                },
                "required": ["name", "email", "intent"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "extract_invoice",
            "description": (
                "Call this when the email contains an invoice, bill, or payment request "
                "with vendor details and amounts."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "vendor": {"type": "string", "description": "Vendor or sender company name"},
                    "invoice_number": {"type": "string", "description": "Invoice or reference number"},
                    "amount": {"type": "number", "description": "Total invoice amount"},
                    "currency": {"type": "string", "description": "Currency code e.g. USD, INR"},
                    "due_date": {"type": "string", "description": "Due date as YYYY-MM-DD or empty string"},
                    "line_items": {
                        "type": "array",
                        "description": "Individual line items, if present",
                        "items": {
                            "type": "object",
                            "properties": {
                                "description": {"type": "string"},
                                "quantity": {"type": "number"},
                                "unit_price": {"type": "number"},
                                "total": {"type": "number"},
                            },
                            "required": ["description"],
                        },
                    },
                },
                "required": ["vendor", "amount"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "extract_transaction",
            "description": (
                "Call this when the email confirms a completed payment, bank transfer, "
                "or financial transaction."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string", "description": "Transaction or reference ID"},
                    "amount": {"type": "number", "description": "Transaction amount"},
                    "currency": {"type": "string", "description": "Currency code e.g. USD, INR"},
                    "date": {"type": "string", "description": "Transaction date as YYYY-MM-DD"},
                    "payer": {"type": "string", "description": "Who paid"},
                    "payee": {"type": "string", "description": "Who received the payment"},
                    "status": {
                        "type": "string",
                        "enum": ["completed", "pending", "failed", "unknown"],
                        "description": "Transaction status",
                    },
                },
                "required": ["amount", "status"],
            },
        },
    },
]


# ── Dispatchers ────────────────────────────────────────────────────────────

async def dispatch_tool(name: str, args: dict, email: EmailRecord) -> str:
    """Validate args via Pydantic, persist to Mongo, return the type label."""
    base = {"message_id": email.message_id, "received_at": email.received_at}

    if name == "extract_lead":
        lead = Lead.model_validate({**args, **base})
        await save_lead(lead)
        return "lead"

    if name == "extract_invoice":
        invoice = Invoice.model_validate({**args, **base})
        await save_invoice(invoice)
        return "invoice"

    if name == "extract_transaction":
        transaction = Transaction.model_validate({**args, **base})
        await save_transaction(transaction)
        return "transaction"

    raise ValueError(f"Unknown tool: {name}")

import asyncio
import base64
import time
from datetime import datetime, timezone

from core.html_utils import extract_text_from_html
from core.logging import get_logger
from gmail_client.auth import get_gmail_service
from models.schemas import EmailRecord
from config import MAX_CONCURRENT_FETCHES, MAX_FETCH_BATCH, POLL_INTERVAL_SECONDS

logger = get_logger(__name__)


def _extract_header(headers: list, name: str) -> str:
    for h in headers:
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""


def _decode_body(payload: dict) -> str:
    mime_type = payload.get("mimeType", "")
    body_data = payload.get("body", {}).get("data", "")

    if mime_type == "text/plain" and body_data:
        return base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")

    if mime_type == "text/html" and body_data:
        html = base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")
        return extract_text_from_html(html)

    if mime_type.startswith("multipart/"):
        for part in payload.get("parts", []):
            text = _decode_body(part)
            if text:
                return text

    return ""


async def _fetch_single(service, msg_id: str, sem: asyncio.Semaphore) -> EmailRecord | None:
    async with sem:
        msg = None
        for attempt in range(3):
            try:
                msg = await asyncio.to_thread(
                    lambda: service.users().messages().get(
                        userId="me", id=msg_id, format="full"
                    ).execute()
                )
                break
            except Exception as e:
                if attempt == 2:
                    logger.error("Failed to fetch message", message_id=msg_id, error=str(e))
                    return None
                await asyncio.sleep(1.5 ** attempt)
        if msg is None:
            return None

    headers = msg.get("payload", {}).get("headers", [])
    body = _decode_body(msg.get("payload", {}))
    internal_date = int(msg.get("internalDate", 0)) / 1000

    return EmailRecord(
        message_id=msg_id,
        thread_id=msg.get("threadId", ""),
        sender=_extract_header(headers, "From"),
        subject=_extract_header(headers, "Subject"),
        body=body,
        received_at=datetime.fromtimestamp(internal_date, tz=timezone.utc),
    )


async def fetch_new_emails() -> list[EmailRecord]:
    """Fetch emails received within the last POLL_INTERVAL_SECONDS window."""
    service = get_gmail_service()

    # Gmail `after:` accepts a Unix epoch timestamp
    after_ts = int(time.time()) - POLL_INTERVAL_SECONDS
    query = f"is:unread after:{after_ts}"

    list_result = await asyncio.to_thread(
        lambda: service.users().messages().list(
            userId="me", q=query, maxResults=MAX_FETCH_BATCH
        ).execute()
    )

    messages = list_result.get("messages", [])
    if not messages:
        return []

    msg_ids = [m["id"] for m in messages]
    logger.info("Fetching email payloads", count=len(msg_ids), window_seconds=POLL_INTERVAL_SECONDS)

    sem = asyncio.Semaphore(MAX_CONCURRENT_FETCHES)
    tasks = [_fetch_single(service, msg_id, sem) for msg_id in msg_ids]
    fetched = await asyncio.gather(*tasks)

    emails = [e for e in fetched if e is not None]
    for e in emails:
        logger.info("Fetched email", subject=e.subject, sender=e.sender)
    return emails

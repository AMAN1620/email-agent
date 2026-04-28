import asyncio

from core.logging import get_logger
from gmail_client.auth import get_gmail_service

logger = get_logger(__name__)


async def mark_email_read(message_id: str) -> None:
    service = get_gmail_service()
    try:
        await asyncio.to_thread(
            lambda: service.users().messages().modify(
                userId="me",
                id=message_id,
                body={"removeLabelIds": ["UNREAD"]},
            ).execute()
        )
        logger.info("Marked email as read", message_id=message_id)
    except Exception as e:
        logger.warning("Failed to mark email as read", message_id=message_id, error=str(e))

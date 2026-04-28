from datetime import datetime, timedelta, timezone

from db.async_mongo import get_db
from config import CLAIM_TTL_SECONDS, MAX_ATTEMPTS, WORKER_ID


def _col():
    return get_db()["processed_emails"]


async def try_claim(
    message_id: str,
    sender: str = "",
    subject: str = "",
    body: str = "",
    received_at=None,
) -> bool:
    """
    Atomically claim an email for processing.
    Returns True if successfully claimed, False if already in-progress or done.
    Stores email metadata (sender, subject, preview) for dashboard visibility.
    """
    now = datetime.now(timezone.utc)
    stale_cutoff = now - timedelta(seconds=CLAIM_TTL_SECONDS)

    result = await _col().update_one(
        {
            "message_id": message_id,
            "$or": [
                {"status": {"$exists": False}},
                {"status": "failed", "attempts": {"$lt": MAX_ATTEMPTS}},
                {"status": "in_progress", "claimed_at": {"$lt": stale_cutoff}},
            ],
        },
        {
            "$set": {
                "status": "in_progress",
                "claimed_at": now,
                "worker_id": WORKER_ID,
                "error": None,
            },
            "$inc": {"attempts": 1},
            "$setOnInsert": {
                "message_id": message_id,
                "types_detected": [],
                "processed_at": None,
                "sender": sender,
                "subject": subject,
                "preview": body[:500].strip(),
                "received_at": received_at,
            },
        },
        upsert=True,
    )
    return bool(result.upserted_id or result.modified_count)


async def mark_done(message_id: str, types: list[str]) -> None:
    now = datetime.now(timezone.utc)
    await _col().update_one(
        {"message_id": message_id},
        {"$set": {
            "status": "done",
            "processed_at": now,
            "types_detected": types,
            "error": None,
        }},
    )


async def mark_failed(message_id: str, error: str) -> None:
    await _col().update_one(
        {"message_id": message_id},
        {"$set": {"status": "failed", "error": error}},
    )


async def get_done_message_ids() -> set[str]:
    """Returns all message_ids that are already done — used by fetcher to pre-filter."""
    done = set()
    cursor = _col().find({"status": "done"}, {"message_id": 1, "_id": 0})
    async for doc in cursor:
        done.add(doc["message_id"])
    return done

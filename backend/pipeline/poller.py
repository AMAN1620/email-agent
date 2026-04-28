import asyncio

from core.logging import get_logger
from gmail_client.fetcher import fetch_new_emails
from pipeline.orchestrator import classify_and_route
from models.schemas import PollResult

logger = get_logger(__name__)


async def poll_and_process() -> PollResult:
    logger.info("Poll cycle started")
    result = PollResult(fetched=0, processed=0, skipped=0, failed=0)

    try:
        emails = await fetch_new_emails()
        result.fetched = len(emails)

        if not emails:
            logger.info("No new emails")
            return result

        # Process all emails concurrently (orchestrator has its own claim guard)
        statuses = await asyncio.gather(
            *(classify_and_route(e) for e in emails),
            return_exceptions=True,
        )

        for status in statuses:
            if isinstance(status, Exception):
                result.failed += 1
            elif status == "processed":
                result.processed += 1
            elif status == "skipped":
                result.skipped += 1
            else:
                result.failed += 1

    except Exception as e:
        logger.error("Poll cycle failed", error=str(e))

    logger.info("Poll cycle complete", **result.model_dump())
    return result

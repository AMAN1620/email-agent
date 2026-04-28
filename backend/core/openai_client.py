from openai import AsyncOpenAI

from config import OPENAI_API_KEY, OPENAI_TIMEOUT

_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        # max_retries=0 — retries handled by tenacity in core/retry.py
        _client = AsyncOpenAI(
            api_key=OPENAI_API_KEY,
            timeout=OPENAI_TIMEOUT,
            max_retries=0,
        )
    return _client

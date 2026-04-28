from fastapi import Header, HTTPException, status
from config import API_KEY


async def require_api_key(x_api_key: str | None = Header(default=None)):
    """Protect sensitive endpoints with an API key header.
    If API_KEY is not set in .env, the check is skipped (dev mode).
    """
    if not API_KEY:
        return  # dev mode — no key configured, allow all
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header",
        )

from fastapi import APIRouter
from core.logging import get_logger
from models.schemas import HealthResponse
from db.async_mongo import get_db
from core.openai_client import get_openai_client

router = APIRouter(tags=["health"])
logger = get_logger(__name__)


@router.get("/healthz", response_model=HealthResponse)
async def healthz():
    return HealthResponse(status="ok")


@router.get("/readyz", response_model=HealthResponse)
async def readyz():
    checks: dict[str, str] = {}
    try:
        await get_db().command("ping")
        checks["mongo"] = "ok"
    except Exception as e:
        logger.error("MongoDB health check failed", error=str(e))
        checks["mongo"] = "error"  # don't leak internals to client

    try:
        get_openai_client()
        checks["openai_client"] = "ok"
    except Exception as e:
        logger.error("OpenAI client health check failed", error=str(e))
        checks["openai_client"] = "error"

    status = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return HealthResponse(status=status, checks=checks)

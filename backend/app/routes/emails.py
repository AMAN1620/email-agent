from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Literal
from models.schemas import ProcessedEmail, PaginatedResponse
from db.repositories import list_processed
from db.async_mongo import get_db
from app.dependencies import require_api_key

router = APIRouter(tags=["emails"])


@router.get("/emails", response_model=PaginatedResponse[ProcessedEmail])
async def get_emails(
    page: int = Query(1, ge=1, le=1000),
    page_size: int = Query(20, ge=1, le=100),
    status: Literal["in_progress", "done", "failed"] | None = Query(None),
):
    items, total = await list_processed(page=page, page_size=page_size, status=status)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)


class DeleteRequest(BaseModel):
    message_ids: list[str]


@router.delete("/emails", response_model=dict, dependencies=[Depends(require_api_key)])
async def delete_emails(body: DeleteRequest):
    if not body.message_ids:
        return {"deleted": 0}
    result = await get_db()["processed_emails"].delete_many(
        {"message_id": {"$in": body.message_ids}}
    )
    return {"deleted": result.deleted_count}

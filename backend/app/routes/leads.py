from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from models.schemas import Lead, PaginatedResponse
from db.repositories import list_leads
from db.async_mongo import get_db
from app.dependencies import require_api_key

router = APIRouter(tags=["leads"])


@router.get("/leads", response_model=PaginatedResponse[Lead])
async def get_leads(
    page: int = Query(1, ge=1, le=1000),
    page_size: int = Query(20, ge=1, le=100),
):
    items, total = await list_leads(page=page, page_size=page_size)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)


class DeleteRequest(BaseModel):
    message_ids: list[str]


@router.delete("/leads", response_model=dict, dependencies=[Depends(require_api_key)])
async def delete_leads(body: DeleteRequest):
    if not body.message_ids:
        return {"deleted": 0}
    result = await get_db()["leads"].delete_many(
        {"message_id": {"$in": body.message_ids}}
    )
    return {"deleted": result.deleted_count}

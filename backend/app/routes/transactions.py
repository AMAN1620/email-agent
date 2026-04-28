from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from models.schemas import Transaction, PaginatedResponse
from db.repositories import list_transactions
from db.async_mongo import get_db
from app.dependencies import require_api_key

router = APIRouter(tags=["transactions"])


@router.get("/transactions", response_model=PaginatedResponse[Transaction])
async def get_transactions(
    page: int = Query(1, ge=1, le=1000),
    page_size: int = Query(20, ge=1, le=100),
):
    items, total = await list_transactions(page=page, page_size=page_size)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)


class DeleteRequest(BaseModel):
    message_ids: list[str]


@router.delete("/transactions", response_model=dict, dependencies=[Depends(require_api_key)])
async def delete_transactions(body: DeleteRequest):
    if not body.message_ids:
        return {"deleted": 0}
    result = await get_db()["transactions"].delete_many(
        {"message_id": {"$in": body.message_ids}}
    )
    return {"deleted": result.deleted_count}

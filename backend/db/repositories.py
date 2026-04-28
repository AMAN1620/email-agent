from datetime import datetime, timezone

from models.schemas import Lead, Invoice, Transaction, ProcessedEmail
from db.async_mongo import get_db


# ── Leads ──────────────────────────────────────────────────────────────────

async def save_lead(lead: Lead) -> None:
    await get_db()["leads"].update_one(
        {"message_id": lead.message_id},
        {"$setOnInsert": lead.model_dump()},
        upsert=True,
    )


async def list_leads(page: int = 1, page_size: int = 20) -> tuple[list[Lead], int]:
    col = get_db()["leads"]
    skip = (page - 1) * page_size
    total = await col.count_documents({})
    cursor = col.find().sort("received_at", -1).skip(skip).limit(page_size)
    items = [Lead.model_validate(d) async for d in cursor]
    return items, total


# ── Invoices ───────────────────────────────────────────────────────────────

async def save_invoice(invoice: Invoice) -> None:
    await get_db()["invoices"].update_one(
        {"message_id": invoice.message_id},
        {"$setOnInsert": invoice.model_dump()},
        upsert=True,
    )


async def list_invoices(page: int = 1, page_size: int = 20) -> tuple[list[Invoice], int]:
    col = get_db()["invoices"]
    skip = (page - 1) * page_size
    total = await col.count_documents({})
    cursor = col.find().sort("received_at", -1).skip(skip).limit(page_size)
    items = [Invoice.model_validate(d) async for d in cursor]
    return items, total


# ── Transactions ───────────────────────────────────────────────────────────

async def save_transaction(transaction: Transaction) -> None:
    await get_db()["transactions"].update_one(
        {"message_id": transaction.message_id},
        {"$setOnInsert": transaction.model_dump()},
        upsert=True,
    )


async def list_transactions(page: int = 1, page_size: int = 20) -> tuple[list[Transaction], int]:
    col = get_db()["transactions"]
    skip = (page - 1) * page_size
    total = await col.count_documents({})
    cursor = col.find().sort("received_at", -1).skip(skip).limit(page_size)
    items = [Transaction.model_validate(d) async for d in cursor]
    return items, total


# ── Processed emails ───────────────────────────────────────────────────────

async def list_processed(
    page: int = 1, page_size: int = 20, status: str | None = None
) -> tuple[list[ProcessedEmail], int]:
    col = get_db()["processed_emails"]
    query = {"status": status} if status else {}
    skip = (page - 1) * page_size
    total = await col.count_documents(query)
    cursor = col.find(query).sort("claimed_at", -1).skip(skip).limit(page_size)
    items = [ProcessedEmail.model_validate(d) async for d in cursor]
    return items, total


async def list_failed(page: int = 1, page_size: int = 20) -> tuple[list[ProcessedEmail], int]:
    return await list_processed(page=page, page_size=page_size, status="failed")

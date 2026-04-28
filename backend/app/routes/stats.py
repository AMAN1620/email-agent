from fastapi import APIRouter
from db.async_mongo import get_db

router = APIRouter(tags=["stats"])


@router.get("/stats")
async def get_stats():
    db = get_db()

    # Total counts
    total_emails = await db["processed_emails"].count_documents({})
    total_leads = await db["leads"].count_documents({})
    total_transactions = await db["transactions"].count_documents({})
    total_invoices = await db["invoices"].count_documents({})
    total_failed = await db["processed_emails"].count_documents({"status": "failed"})

    # Email type breakdown
    pipeline_breakdown = [
        {"$unwind": "$types_detected"},
        {"$group": {"_id": "$types_detected", "count": {"$sum": 1}}},
    ]
    breakdown_raw = await db["processed_emails"].aggregate(pipeline_breakdown).to_list(20)
    breakdown = {item["_id"]: item["count"] for item in breakdown_raw}

    # Total transaction spend (completed only)
    pipeline_spend = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    spend_raw = await db["transactions"].aggregate(pipeline_spend).to_list(1)
    total_spend = spend_raw[0]["total"] if spend_raw else 0.0

    # Total invoices outstanding
    pipeline_inv = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    inv_raw = await db["invoices"].aggregate(pipeline_inv).to_list(1)
    total_invoices_amount = inv_raw[0]["total"] if inv_raw else 0.0

    # Daily activity — last 7 days
    pipeline_activity = [
        {"$match": {"status": "done"}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$processed_at",
                    }
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 7},
    ]
    activity_raw = await db["processed_emails"].aggregate(pipeline_activity).to_list(7)
    activity = [{"date": item["_id"], "count": item["count"]} for item in activity_raw]

    # Top payees by spend
    pipeline_payees = [
        {"$match": {"status": "completed", "amount": {"$gt": 0}}},
        {"$group": {"_id": "$payee", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}},
        {"$limit": 5},
    ]
    payees_raw = await db["transactions"].aggregate(pipeline_payees).to_list(5)
    top_payees = [{"name": item["_id"], "amount": item["total"]} for item in payees_raw]

    return {
        "totals": {
            "emails": total_emails,
            "leads": total_leads,
            "transactions": total_transactions,
            "invoices": total_invoices,
            "failed": total_failed,
            "spend": round(total_spend, 2),
            "invoices_amount": round(total_invoices_amount, 2),
        },
        "breakdown": breakdown,
        "activity": activity,
        "top_payees": top_payees,
    }

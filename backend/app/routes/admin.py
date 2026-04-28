from fastapi import APIRouter, Depends, Request
from models.schemas import PollResult, ProcessedEmail, PaginatedResponse
from pipeline.poller import poll_and_process
from db.repositories import list_failed
from app.dependencies import require_api_key

router = APIRouter(tags=["admin"], dependencies=[Depends(require_api_key)])


@router.post("/admin/poll", response_model=PollResult)
async def manual_poll():
    return await poll_and_process()


@router.get("/admin/scheduler")
async def scheduler_status(request: Request):
    scheduler = request.app.state.scheduler
    jobs = [
        {
            "id": job.id,
            "next_run": str(job.next_run_time),
            "trigger": str(job.trigger),
        }
        for job in scheduler.get_jobs()
    ]
    return {"running": scheduler.running, "jobs": jobs}


@router.get("/admin/failed", response_model=PaginatedResponse[ProcessedEmail])
async def get_failed(page: int = 1, page_size: int = 20):
    items, total = await list_failed(page=page, page_size=page_size)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)

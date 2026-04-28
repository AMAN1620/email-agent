from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from core.logging import setup_logging, get_logger

setup_logging()  # must run before any get_logger() call

from db.async_mongo import ensure_indexes
from pipeline.poller import poll_and_process
from config import POLL_INTERVAL_SECONDS
import os
from app.routes import health, emails, leads, invoices, transactions, admin, stats
from fastapi.middleware.cors import CORSMiddleware

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    logger.info("MongoDB indexes ensured")

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        poll_and_process,
        trigger="interval",
        seconds=POLL_INTERVAL_SECONDS,
        id="email_poll",
        next_run_time=datetime.now() + timedelta(seconds=10),  # 10s delay after startup
    )
    scheduler.start()
    app.state.scheduler = scheduler
    logger.info("Scheduler started", interval_seconds=POLL_INTERVAL_SECONDS)

    yield

    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")


app = FastAPI(
    title="Email Agent API",
    description="AI-powered email processing pipeline with lead, invoice, and transaction extraction.",
    version="2.0.0",
    lifespan=lifespan,
)

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(stats.router)
app.include_router(emails.router)
app.include_router(leads.router)
app.include_router(invoices.router)
app.include_router(transactions.router)
app.include_router(admin.router)

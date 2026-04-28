from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field


class EmailRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message_id: str
    thread_id: str = ""
    sender: str
    subject: str = ""
    body: str = ""
    received_at: datetime


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message_id: str
    name: str = ""
    company: str = ""
    email: str = ""
    phone: str = ""
    intent: str = ""
    source: str = ""
    received_at: datetime


class InvoiceLineItem(BaseModel):
    description: str = ""
    quantity: float = 0
    unit_price: float = 0.0
    total: float = 0.0


class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message_id: str
    vendor: str = ""
    invoice_number: str = ""
    amount: float = 0.0
    currency: str = "USD"
    due_date: str = ""
    line_items: list[InvoiceLineItem] = Field(default_factory=list)
    received_at: datetime


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message_id: str
    transaction_id: str = ""
    amount: float = 0.0
    currency: str = "USD"
    date: str = ""
    payer: str = ""
    payee: str = ""
    status: Literal["completed", "pending", "failed", "unknown"] = "unknown"
    received_at: datetime


ProcessedStatus = Literal["in_progress", "done", "failed"]


class ProcessedEmail(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message_id: str
    status: ProcessedStatus
    claimed_at: datetime
    processed_at: datetime | None = None
    attempts: int = 0
    types_detected: list[str] = Field(default_factory=list)
    error: str | None = None
    worker_id: str = ""
    # email content stored at claim time
    sender: str = ""
    subject: str = ""
    preview: str = ""        # first 500 chars of body
    received_at: datetime | None = None


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class PollResult(BaseModel):
    fetched: int
    processed: int
    skipped: int
    failed: int


class HealthResponse(BaseModel):
    status: str
    checks: dict[str, str] = Field(default_factory=dict)

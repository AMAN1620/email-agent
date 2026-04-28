import dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from pymongo.operations import IndexModel
from config import MONGODB_URI, MONGODB_DB_NAME

# Force dnspython to use Google's public DNS for SRV resolution.
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ["8.8.8.8", "8.8.4.4"]

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[MONGODB_DB_NAME]


async def ensure_indexes():
    db = get_db()
    await db["processed_emails"].create_indexes([
        IndexModel([("message_id", ASCENDING)], unique=True),
    ])
    await db["leads"].create_indexes([
        IndexModel([("message_id", ASCENDING)], unique=True),
        IndexModel([("received_at", DESCENDING)]),
    ])
    await db["invoices"].create_indexes([
        IndexModel([("message_id", ASCENDING)], unique=True),
        IndexModel([("received_at", DESCENDING)]),
    ])
    await db["transactions"].create_indexes([
        IndexModel([("message_id", ASCENDING)], unique=True),
        IndexModel([("received_at", DESCENDING)]),
    ])

import os
import uuid
from dotenv import load_dotenv

load_dotenv()

# Gmail / Google
GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json")
GOOGLE_TOKEN_PATH = "token.json"
# gmail.modify allows read + label modification (mark as read)
GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT", "30"))

# MongoDB
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "email_agent")

# Pipeline
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "120"))
MAX_CONCURRENT_FETCHES = int(os.getenv("MAX_CONCURRENT_FETCHES", "10"))
MAX_FETCH_BATCH = int(os.getenv("MAX_FETCH_BATCH", "50"))
CLAIM_TTL_SECONDS = int(os.getenv("CLAIM_TTL_SECONDS", "600"))
MAX_ATTEMPTS = int(os.getenv("MAX_ATTEMPTS", "3"))
WORKER_ID = os.getenv("WORKER_ID") or str(uuid.uuid4())

# API
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_KEY = os.getenv("API_KEY")  # if set, all mutating + admin endpoints require X-API-Key header

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = os.getenv("LOG_FORMAT", "console")  # console | json

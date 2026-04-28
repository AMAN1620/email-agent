# Email Agent

An AI-powered email processing pipeline that automatically reads your Gmail, classifies emails (leads, invoices, transactions), extracts structured data, and stores it in MongoDB. Includes a dashboard to view and manage processed emails.

---

## How it works

```
Gmail (every 5 min)
    ↓
Orchestrator (OpenAI GPT-4o-mini)
    ↓ decides which agents to call
Lead Agent / Invoice Agent / Transaction Agent
    ↓
MongoDB (stores extracted data)
    ↓
Dashboard (Next.js)
```

---

## Project Structure

```
email-agent/
├── backend/      # FastAPI + Python pipeline
└── frontend/     # Next.js dashboard
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud account (free)
- OpenAI account

---

## Credentials You Need

### 1. OpenAI API Key
- Go to https://platform.openai.com/api-keys
- Create a new secret key
- Used for: email classification and data extraction

### 2. MongoDB URI
- Go to https://cloud.mongodb.com
- Create a free cluster → click **Connect** → **Drivers**
- Copy the connection string, replace `<password>` with your DB user password
- Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### 3. Google OAuth Credentials (`credentials.json`)
- Go to https://console.cloud.google.com
- Create a project → **APIs & Services** → **Enable APIs** → enable **Gmail API**
- Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **Desktop app**
- Download the JSON file and save it as `backend/credentials.json`
- Used for: reading and marking emails in Gmail

### 4. API Key (self-generated)
Generate one yourself:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Used for: protecting delete and admin endpoints.

---

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python3.11 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Fill in .env with your credentials (see below)

# Run
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**First run:** A browser window will open asking you to authorize Gmail access. Sign in and allow — this creates `token.json` which is reused on future runs.

#### `backend/.env`

```env
GOOGLE_CREDENTIALS_PATH=credentials.json
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
MONGODB_DB_NAME=your_db_name
POLL_INTERVAL_SECONDS=300
MAX_CONCURRENT_FETCHES=5
MAX_FETCH_BATCH=20
API_KEY=your-generated-api-key
CORS_ORIGINS=http://localhost:3000
```

---

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Fill in .env.local (see below)

# Run
npm run dev
```

Open http://localhost:3000

#### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-generated-api-key  # same key as backend API_KEY
```

---

## Files to Never Commit

These are already in `.gitignore`:

| File | Why |
|---|---|
| `backend/.env` | Contains all secrets |
| `backend/credentials.json` | Google OAuth client secret |
| `backend/token.json` | Gmail access token |
| `frontend/.env.local` | Contains API key |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/healthz` | Liveness check |
| GET | `/readyz` | Checks MongoDB + OpenAI |
| GET | `/stats` | Dashboard aggregates |
| GET | `/emails` | Processed emails (paginated) |
| GET | `/leads` | Extracted leads |
| GET | `/transactions` | Extracted transactions |
| GET | `/invoices` | Extracted invoices |
| POST | `/admin/poll` | Manually trigger a poll cycle |
| DELETE | `/emails` | Delete email records (requires `X-API-Key`) |
| DELETE | `/leads` | Delete leads (requires `X-API-Key`) |
| DELETE | `/transactions` | Delete transactions (requires `X-API-Key`) |
| DELETE | `/invoices` | Delete invoices (requires `X-API-Key`) |

Full interactive docs at http://localhost:8000/docs

---

## Dashboard Pages

| Page | What it shows |
|---|---|
| Overview | Stats, daily activity chart, spend breakdown |
| Emails | All processed emails with sender, subject, preview |
| Leads | Extracted lead contacts with intent |
| Transactions | Financial transactions with amounts and status |
| Invoices | Invoices with vendor, amount, due date |

All pages support multi-select delete with confirmation.

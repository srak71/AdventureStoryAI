# Choose Your Own Adventure AI

An AI-powered full-stack web app that generates unique, branching choose-your-own-adventure stories on demand. Enter a theme — "pirates", "space exploration", "medieval fantasy" — and GPT-4o-mini builds a complete story graph with multiple paths and endings for you to play through in the browser.

**Live demo:** https://adventure-story-ai.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Backend | FastAPI (Python) |
| AI | LangChain + OpenAI GPT-4o-mini |
| Database | PostgreSQL (Neon serverless) |
| Deployment | Vercel |

---

## Getting an OpenAI API Key

Story generation requires an OpenAI API key. If you see **"Request failed with status code 500"** or a quota error, follow these steps:

### 1. Create an OpenAI account
Go to [platform.openai.com](https://platform.openai.com) and sign up (or log in if you already have an account).

### 2. Add billing credits
1. Click your profile icon → **Billing**
2. Click **Add to credit balance**
3. Add at least $5 — this is enough for hundreds of stories

> GPT-4o-mini is very cheap (~$0.001 per story). $5 will last a long time.

### 3. Create an API key
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Give it a name (e.g. `adventure-story-ai`)
4. Copy the key — it starts with `sk-proj-...`

> ⚠️ You only see the key once. Copy it now and store it somewhere safe.

### 4. Add the key to your environment

**For local development** — add it to `backend/.env`:
```
OPENAI_API_KEY=sk-proj-your-key-here
```

**For Vercel (production)** — go to your Vercel project → **Settings** → **Environment Variables** → update `OPENAI_API_KEY` with your new key, then redeploy.

---

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+

### 1. Clone the repo
```bash
git clone https://github.com/srak71/AdventureStoryAI.git
cd AdventureStoryAI
```

### 2. Set up the backend
```bash
cd backend
pip install -r ../requirements.txt
```

Create `backend/.env`:
```env
DEBUG=True
OPENAI_API_KEY=sk-proj-your-key-here
```

When `DEBUG=True` the app uses a local SQLite database automatically — no PostgreSQL needed.

Start the backend:
```bash
uvicorn main:app --reload
```
API will be at http://localhost:8000

### 3. Set up the frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
VITE_DEBUG=true
```

Start the frontend:
```bash
npm run dev
```
App will be at http://localhost:5173

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `DEBUG` | | `True` for local dev (uses SQLite). Default: `False` |
| `DATABASE_URL` | | Full PostgreSQL URL (e.g. from Neon). Auto-set when `DEBUG=True` |
| `ALLOWED_ORIGINS` | | Comma-separated CORS origins, or `*` to allow all |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_DEBUG` | Set to `true` to proxy `/api` requests to localhost:8000 |
| `VITE_API_BASE_URL` | Override the API base URL for custom deployments |

---

## Deploying to Vercel

The project is configured for Vercel with `vercel.json` at the root. Both the React frontend and FastAPI backend deploy together.

### First-time setup
1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel link` inside the project directory to connect to your Vercel project
3. Set your environment variables in the Vercel dashboard under **Settings → Environment Variables**:
   - `OPENAI_API_KEY` — your OpenAI key
   - `DATABASE_URL` — your Neon PostgreSQL connection string

### Deploy
```bash
vercel deploy --prod
```

### Database
The production deployment uses [Neon](https://neon.tech) serverless PostgreSQL (free tier). Tables are created automatically on first startup.

---

## Project Structure

```
AdventureStoryAI/
├── api/
│   └── index.py          # Vercel Python ASGI entry point
├── backend/
│   ├── core/
│   │   ├── config.py     # Settings (pydantic-settings)
│   │   ├── models.py     # LLM response schemas
│   │   ├── prompts.py    # Story generation prompt
│   │   └── story_generator.py  # LangChain + OpenAI logic
│   ├── db/
│   │   └── database.py   # SQLAlchemy engine + session
│   ├── models/           # SQLAlchemy ORM models
│   ├── routers/          # FastAPI route handlers
│   ├── schemas/          # Pydantic request/response schemas
│   └── main.py           # FastAPI app entry point
├── frontend/
│   └── src/
│       ├── components/   # React components
│       └── util.js       # Shared constants
├── requirements.txt      # Python dependencies
└── vercel.json           # Vercel build + routing config
```

---

## How It Works

1. User enters a theme in the browser
2. Frontend `POST /api/stories/create` → FastAPI generates a job
3. Backend calls OpenAI GPT-4o-mini via LangChain, asking it to produce a complete branching story as structured JSON
4. The full story graph (nodes + options) is saved to PostgreSQL
5. Frontend polls `GET /api/jobs/:id` until complete, then loads `GET /api/stories/:id/complete`
6. The story is rendered as an interactive choose-your-own-adventure game entirely client-side — no extra fetches needed per choice

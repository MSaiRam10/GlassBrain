# GlassBrain

LLM observability platform - monitor your AI applications in real time. Track every LLM call, measure costs and latency, replay runs, and set alerts.

**Live:** [https://glassbrain.dev](https://glassbrain.dev)

---

## What It Does

GlassBrain captures every LLM call your application makes and gives you full visibility into:

- **Cost** - how much each call costs and total spend over time
- **Latency** - how long each call takes
- **Tokens** - prompt and completion token usage
- **Traces** - full prompt and response for every call
- **Replay** - re-run any past prompt and compare the new response to the original
- **Alerts** - get notified when cost, latency, or tokens exceed your threshold

---

## How It Works

### 1. Register and get an API key

Sign up at [glassbrain.dev](https://glassbrain.dev), go to **API Keys**, and create a key.

### 2. Install the SDK

```bash
pip install glassbrain
```

### 3. Integrate - two ways

#### Option A: LangChain / LangGraph projects

```python
from langchain_openai import ChatOpenAI
from glassbrain.callback import GlassBrainCallback

callback = GlassBrainCallback(
    api_key="your-glassbrain-api-key",
    endpoint="https://glassbrain.dev"
)

llm = ChatOpenAI(model="gpt-4o-mini", callbacks=[callback])
```

Every LLM call through LangChain is now automatically traced. No other changes needed.

#### Option B: Direct OpenAI or Anthropic projects

```python
from openai import OpenAI
from glassbrain.client import GlassBrain
from glassbrain.wrappers import wrap_openai

client = OpenAI()
gb = GlassBrain(
    api_key="your-glassbrain-api-key",
    endpoint="https://glassbrain.dev"
)
wrap_openai(client, gb)

# All calls to client.chat.completions.create() are now traced
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}]
)
```


#### Option C: Direct Anthropic projects

```python
from anthropic import Anthropic
from glassbrain.client import GlassBrain
from glassbrain.wrappers import wrap_anthropic

client = Anthropic()
gb = GlassBrain(
    api_key="your-glassbrain-api-key",
    endpoint="https://glassbrain.dev"
)
wrap_anthropic(client, gb)

# All calls to client.messages.create() are now traced
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
)
```

### 4. View your traces

Go to [glassbrain.dev](https://glassbrain.dev) → **Traces** to see every call with full details.

---

## Dashboard

| Page | What it shows |
|------|--------------|
| Dashboard | Total traces, total cost, avg latency, total tokens |
| Traces | Every LLM call with prompt, response, model, latency, tokens, cost |
| API Keys | Create and manage API keys |
| Alerts | Set thresholds - get flagged when cost, latency, or tokens exceed limits |

---

## Replay

Click **Replay** on any trace to re-run that exact prompt against the same model. Compare the original response to the new one - useful for testing prompt changes and debugging regressions.

---

## Alerts

Set alert rules from the Alerts page:

- **Cost** - alert when a single call costs more than $X
- **Latency** - alert when a call takes longer than X seconds
- **Tokens** - alert when a call uses more than X tokens

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Frontend | React + Vite + Tailwind CSS |
| SDK | Python package on PyPI (`pip install glassbrain`) |
| Deployment | Docker + Nginx + SSL on Google Cloud |

---

## Self-hosting

### Prerequisites

- Docker and Docker Compose
- PostgreSQL

### 1. Clone the repo

```bash
git clone https://github.com/MSaiRam10/GlassBrain.git
cd GlassBrain
```

### 2. Create backend `.env`

```
DATABASE_URL=postgresql://postgres:password@db:5432/glassbrain
JWT_SECRET=your_random_string
OPENAI_API_KEY=your_openai_key
```

### 3. Run

```bash
cd glassbrain-backend
docker-compose up --build
```

Backend runs on port `8006`.

### 4. Run frontend

```bash
cd glassbrain-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Project Structure

```
GlassBrain/
├── glassbrain-backend/
│   ├── api.py          # FastAPI - all endpoints
│   ├── auth.py         # JWT and password hashing
│   ├── database.py     # PostgreSQL models
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
└── glassbrain-frontend/
    └── src/
        ├── App.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Traces.jsx
            ├── Keys.jsx
            └── Alerts.jsx
```
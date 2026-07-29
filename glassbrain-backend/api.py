from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from auth import create_jwt, verify_jwt, hash_password, verify_password
from database import Alert, User, APIKey, Trace, Organization, get_db
import secrets
from sqlalchemy.orm import Session
from openai import OpenAI


client = OpenAI()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class TraceRequest(BaseModel):
    type: str = None
    message: str = None
    source: str = None
    metadata: dict = None
    # keep original fields for direct POST
    prompt: str = None
    response: str = None
    model: str = None
    latency: float = None
    tokens: int = None
    cost: float = None

class AlertRequest(BaseModel):
    metric: str  # cost, latency, tokens
    threshold: float

@app.post("/auth/register")
def user_register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_username = db.query(User).filter(User.username == request.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    org = Organization(name=f"{request.username}'s organization")
    db.add(org)
    db.flush()
    hashed = hash_password(request.password)
    new_user = User(username=request.username, password_hash=hashed, organization_id=org.id)
    db.add(new_user)
    db.commit()
    token = create_jwt({"username": request.username})
    return {"token": token}

@app.post("/auth/login")
def user_login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    token = create_jwt({"username": request.username})
    return {"token": token}

@app.post("/traces")
def create_trace(request: TraceRequest, x_api_key: str = Header(), db: Session = Depends(get_db)):
    api_key = db.query(APIKey).filter(APIKey.key == x_api_key).first()
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # extract from SDK format or direct format
    metadata = request.metadata or {}
    messages = metadata.get("messages", [])
    prompt = request.prompt or (messages[-1].get("content", "") if messages else "")
    response = request.response or str(metadata.get("response", ""))
    model = request.model or metadata.get("model", "unknown")
    latency = request.latency or (metadata.get("duration_ms", 0) / 1000)
    tokens_data = metadata.get("tokens", {})
    tokens = request.tokens or tokens_data.get("total", 0)
    cost = request.cost or 0
    
    trace = Trace(
        user_id=api_key.user_id,
        organization_id=api_key.organization_id,
        prompt=prompt,
        response=response,
        model=model,
        latency=latency,
        tokens=tokens,
        cost=cost
    )
    db.add(trace)
    db.commit()
    return {"message": "trace logged"}

@app.get("/traces")
def user_traces(db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    traces = db.query(Trace).filter(Trace.user_id == user.id).all()
    return {"traces": [{"id": t.id, "prompt": t.prompt, "response": t.response, "model": t.model, "latency": t.latency, "tokens": t.tokens, "cost": t.cost, "created_at": str(t.created_at)} for t in traces]}

@app.get("/analytics")
def analytics(db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    traces = db.query(Trace).filter(Trace.organization_id == user.organization_id).all()
    
    total_cost = sum(t.cost or 0 for t in traces)
    avg_latency = sum(t.latency or 0 for t in traces) / len(traces) if traces else 0
    total_tokens = sum(t.tokens or 0 for t in traces)
    total_traces = len(traces)
    
    return {
        "total_cost": total_cost,
        "avg_latency": avg_latency,
        "total_tokens": total_tokens,
        "total_traces": total_traces
    }


@app.post("/keys/create")
def create_apikey(db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    api_key = secrets.token_hex(32)
    new_apikey = APIKey(user_id=user.id, organization_id=user.organization_id, name=username, key=api_key)
    db.add(new_apikey)
    db.commit()
    return {"api_key": api_key}

@app.get("/keys")
def user_keys(db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    api_keys = db.query(APIKey).filter(APIKey.user_id == user.id).all()
    return {"api_keys": [{"name": k.name, "key": k.key} for k in api_keys]}

@app.post("/alerts/create")
def create_alert(request: AlertRequest, db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    alert = Alert(
        user_id=user.id,
        organization_id=user.organization_id,
        metric=request.metric,
        threshold=request.threshold
    )
    db.add(alert)
    db.commit()
    return {"message": "alert created"}

@app.get("/alerts")
def user_alerts(db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    alerts = db.query(Alert).filter(Alert.user_id == user.id).all()
    return {"alerts": [{"metric": a.metric, "threshold": a.threshold, "created_at": str(a.created_at)} for a in alerts]}

@app.get("/traces/{trace_id}/replay")
def replay_trace(trace_id: int, db: Session = Depends(get_db), x_api_key: str = Header()):
    payload = verify_jwt(x_api_key)
    username = payload["username"]
    user = db.query(User).filter(User.username == username).first()
    
    trace = db.query(Trace).filter(Trace.id == trace_id, Trace.organization_id == user.organization_id).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    
    new_response = client.chat.completions.create(
        model=trace.model,
        messages=[{"role": "user", "content": trace.prompt}]
    )
    
    return {
        "original_response": trace.response,
        "new_response": new_response.choices[0].message.content,
        "model": trace.model,
        "prompt": trace.prompt
    }
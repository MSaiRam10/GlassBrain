from datetime import datetime
from sqlalchemy import create_engine, Integer, String, Column, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    organization_id = Column(Integer, nullable=True)

class Organization(Base):
    __tablename__ = "organization"

    id = Column(Integer,primary_key=True, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Trace(Base):
    __tablename__ = "traces"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    organization_id = Column(Integer, nullable=False)
    prompt = Column(String, nullable=False)
    response = Column(String, nullable=False)
    model = Column(String, nullable=False)
    latency = Column(Float, nullable=True)
    tokens = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    organization_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    key = Column(String, unique=True, nullable=False)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    organization_id = Column(Integer, nullable=False)
    metric = Column(String, nullable=False)  # cost, latency, tokens
    threshold = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)

def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Date, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
import urllib.parse  # parser to handle the special characters
from pathlib import Path

# Load variables from .env file
base_path = Path(__file__).resolve().parent
env_path = base_path / ".env"

load_dotenv(dotenv_path=env_path)

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")

encoded_password = urllib.parse.quote_plus(DB_PASS)

DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

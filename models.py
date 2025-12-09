import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Date, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
import urllib.parse  # parser to handle the special characters

# Load variables from .env file
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")

encoded_password = urllib.parse.quote_plus(DB_PASS)

DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    overview = Column(Text)
    genres = Column(JSON)
    poster_path = Column(String(255))
    popularity = Column(Float)
    release_date = Column(Date, nullable=True)


if __name__ == "__main__":
    print("Creating tables in database ...")
    Base.metadata.create_all(bind=engine)
    print("Tables created!")

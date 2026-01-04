from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Movie

app = FastAPI()


# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/movies/trending")
def get_trending(db: Session = Depends(get_db)):
    # Sort by popularity to get 'Trending'
    return db.query(Movie).order_by(Movie.popularity.desc()).limit(10).all()


@app.get("/movies/top-rated")
def get_top_rated(db: Session = Depends(get_db)):
    # Sort by tmdb_id
    return db.query(Movie).order_by(Movie.tmdb_id).limit(10).all()

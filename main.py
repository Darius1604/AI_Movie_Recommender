from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Movie, MovieCategory, Genre

app = FastAPI()


# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Helper function to reduce code repetition
def get_movies_by_category(category: str, db: Session, limit: int = 20):
    return (
        db.query(Movie)
        .join(MovieCategory)
        .filter(MovieCategory.category_name == category)
        .order_by(Movie.popularity.desc())
        .limit(limit)
        .all()
    )


@app.get("/movies/trending")
def get_trending(db: Session = Depends(get_db)):
    # Sort by popularity to get 'Trending'
    return get_movies_by_category("popular", db)


@app.get("/movies/top-rated")
def get_top_rated(db: Session = Depends(get_db)):
    # Sort by tmdb_id
    return (
        db.query(Movie)
        .join(MovieCategory)
        .filter(MovieCategory.category_name == "top_rated")
        .order_by(Movie.vote_average.desc())
        .limit(20)
        .all()
    )


@app.get("/movies/upcoming")
def get_upcoming(db: Session = Depends(get_db)):
    return get_movies_by_category("upcoming", db)


@app.get("/movies/now-playing")
def get_now_playing(db: Session = Depends(get_db)):
    return get_movies_by_category("now_playing", db)


@app.get("/movies/genre/{genre_id}")
def get_by_genre(genre_id: int, db: Session = Depends(get_db)):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()

    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")

    movies = db.query(Movie).filter(Movie.genres.contains([genre_id])).limit(20).all()

    return {"genre_name": genre.name if genre else "Unknown", "movies": movies}

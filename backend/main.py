from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Movie, MovieCategory, Genre
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# Search for movies by title
@app.get("/movies/search")
def search_movies(query: str, db: Session = Depends(get_db)):
    return db.query(Movie).filter(Movie.title.ilike(f"%{query}%")).limit(10).all()


# Get related movies (Basic logic: same genre)
@app.get("/movies/{movie_id}/recommendations")
def get_recommendations(movie_id: int, db: Session = Depends(get_db)):
    # 1. Fetch the movie first
    movie = db.query(Movie).filter(Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # 2. Check if genres exist and is a list
    # If genres is null in Postgres, the overlap operator will fail.
    if movie.genres is None or not isinstance(movie.genres, list):
        return []

    # 3. Use the Postgres '&&' operator via SQLAlchemy .overlap()
    return (
        db.query(Movie)
        .filter(Movie.id != movie_id)  # Don't recommend the same movie
        .filter(Movie.genres.overlap(movie.genres))  # Postgres && operator
        .order_by(Movie.popularity.desc())  # Recommend the best ones first
        .limit(10)
        .all()
    )


@app.get("/movies/{movie_id}")
def get_movie_by_id(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie


@app.get("/movies/tmdb/{tmdb_id}")
def get_movie_by_tmdb_id(tmdb_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific movie by TMDB ID"""
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie

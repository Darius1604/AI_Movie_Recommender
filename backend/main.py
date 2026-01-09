from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Movie, MovieCategory, Genre
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
from fastapi.security import OAuth2PasswordRequestForm
from models import User
import schemas
import auth

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


@app.get("/movies/recommend")
def recommend_by_mood(mood: str = Query(...), db: Session = Depends(get_db)):
    mood_query = mood.lower()

    # 1. MAPPING LOGIC (Level 1 AI)
    # We define keywords that correlate to genres or plot elements
    mood_map = {
        "happy": [35, 10751, 16],  # Comedy, Family, Animation
        "excited": [28, 12, 878],  # Action, Adventure, Sci-Fi
        "relaxed": [10749, 35, 10402],  # Romance, Comedy, Music
        "thoughtful": [18, 36, 99],  # Drama, History, Documentary
        "romantic": [10749],  # Romance, Drama
        "adventurous": [12, 14, 28],  # Adventure, Fantasy, Action
        "need cheering up": [35, 16, 10751],  # Comedy, Animation, Family
        "want intensity": [53, 80, 28],  # Thriller, Crime, Action
        "silly": [35, 16, 10770],  # Comedy, Animation, TV Movie
        "before sleep": [16, 14, 10751],  # Animation, Fantasy, Family
        "need inspiration": [18, 36, 10752],  # Drama, History, War
    }

    # Identify which genre IDs to look for based on the string
    target_genres = []
    for key, genres in mood_map.items():
        if key in mood_query:
            target_genres.extend(genres)

    # 2. DATABASE QUERY
    query = db.query(Movie)

    if target_genres:
        # Postgres overlap (&&) to find movies containing any of these genre IDs
        query = query.filter(Movie.genres.overlap(list(set(target_genres))))
    else:
        # Fallback: if it's a custom string (e.g. "Space adventures"),
        # try searching the overview or title
        query = query.filter(
            (Movie.overview.ilike(f"%{mood}%")) | (Movie.title.ilike(f"%{mood}%"))
        )

    movies = query.order_by(Movie.popularity.desc()).limit(20).all()

    return {"mood": mood, "movies": movies}


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

    if movie.genres is None or not isinstance(movie.genres, list):
        return []

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


@app.post("/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and save new user
    new_user = User(email=user.email, hashed_password=auth.hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Return token immediately so they are logged in
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Standard login endpoint for OAuth2 flow."""
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

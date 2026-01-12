from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from models import Movie, MovieCategory, Genre, User, Favorite
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import schemas
import auth
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from sentence_transformers import SentenceTransformer
from sqlalchemy.sql.expression import func
import secrets

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load a pre-trained semantic model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Global variables for the recommendation engine
movie_embeddings = None
movie_id_to_index = {}
index_to_movie_id = {}

# In-memory storage for reset tokens (In production, use Redis or database)
reset_tokens = {}


def initialize_recommendation_system(db: Session):
    """
    Initialize system by encoding movie metadata into semantic vectors.
    """
    global movie_embeddings, movie_id_to_index, index_to_movie_id

    # Load from cache if it exists to save startup time
    if os.path.exists("movie_embeddings.pkl"):
        print("Loading cached embeddings...")
        with open("movie_embeddings.pkl", "rb") as f:
            cache = pickle.load(f)
            movie_embeddings = cache["embeddings"]
            movie_id_to_index = cache["id_to_index"]
            index_to_movie_id = cache["index_to_id"]
        print("Embeddings loaded from cache!")
        return

    print("Building semantic movie embeddings (this may take a minute)...")
    movies = db.query(Movie).all()
    genres = db.query(Genre).all()
    genre_map = {g.id: g.name for g in genres}

    movie_texts = []
    movie_ids = []

    for movie in movies:
        genre_names = " ".join([genre_map.get(gid, "") for gid in (movie.genres or [])])
        # We build a natural language description for the AI to "read"
        text = f"Title: {movie.title}. Genres: {genre_names}. Overview: {movie.overview or ''}"
        movie_texts.append(text)
        movie_ids.append(movie.id)

    # Encode all texts into a dense vector matrix (Sample count x 384 dimensions)
    movie_embeddings = model.encode(movie_texts, show_progress_bar=True)

    movie_id_to_index = {movie_id: idx for idx, movie_id in enumerate(movie_ids)}
    index_to_movie_id = {idx: movie_id for idx, movie_id in enumerate(movie_ids)}

    with open("movie_embeddings.pkl", "wb") as f:
        pickle.dump(
            {
                "embeddings": movie_embeddings,
                "id_to_index": movie_id_to_index,
                "index_to_id": index_to_movie_id,
            },
            f,
        )
    print(f"Embeddings built for {len(movies)} movies!")


@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        initialize_recommendation_system(db)
    finally:
        db.close()


@app.get("/movies/ai-recommend")
def ai_recommend_movies(
    query: str = Query(..., description="User's mood or preference description"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    global movie_embeddings, movie_id_to_index, index_to_movie_id

    if movie_embeddings is None:
        initialize_recommendation_system(db)

    # Encode user query into the same semantic space
    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding, movie_embeddings)[0]

    # Sort indices by highest similarity
    top_indices = np.argsort(similarities)[::-1][:limit]
    recommended_movie_ids = [index_to_movie_id[idx] for idx in top_indices]

    # Fetch movie data and maintain similarity order
    movies = db.query(Movie).filter(Movie.id.in_(recommended_movie_ids)).all()
    movie_dict = {movie.id: movie for movie in movies}

    results = [movie_dict[mid] for mid in recommended_movie_ids if mid in movie_dict]
    return {"results": results}


@app.get("/movies/recommend")
def recommend_by_mood(mood: str = Query(...), db: Session = Depends(get_db)):
    """Legacy endpoint wrapper for the AI engine."""
    res = ai_recommend_movies(query=mood, limit=20, db=db)
    return {"movies": res["results"]}


@app.get("/movies/trending")
def get_trending(db: Session = Depends(get_db)):
    return db.query(Movie).order_by(Movie.popularity.desc()).limit(20).all()


@app.get("/movies/top-rated")
def get_top_rated(db: Session = Depends(get_db)):
    return (
        db.query(Movie)
        .join(MovieCategory)
        .filter(MovieCategory.category_name == "top_rated")
        .order_by(Movie.vote_average.desc())
        .limit(20)
        .all()
    )


# Endpoint for New Releases (Sorted by date)
@app.get("/movies/new-releases")
def get_new_releases(db: Session = Depends(get_db)):
    # Define what "New" means (e.g., released in the last 90 days)
    three_months_ago = datetime.now() - timedelta(days=90)

    return (
        db.query(Movie)
        .filter(Movie.release_date >= three_months_ago)  # Only recent
        .order_by(Movie.popularity.desc())  # But most popular first
        .limit(20)
        .all()
    )


# Endpoint to discover 3 random genres and their top movies
@app.get("/movies/genre-discovery")
def get_genre_discovery(db: Session = Depends(get_db)):
    random_genres = db.query(Genre).order_by(func.random()).limit(3).all()

    discovery_results = []
    for genre in random_genres:
        movies = (
            db.query(Movie)
            .filter(Movie.genres.contains([genre.id]))
            .order_by(Movie.popularity.desc())
            .limit(15)
            .all()
        )

        if movies:
            discovery_results.append({"genre_name": genre.name, "movies": movies})

    return discovery_results


@app.post("/movies/rebuild-embeddings")
def rebuild_embeddings(db: Session = Depends(get_db)):
    if os.path.exists("movie_embeddings.pkl"):
        os.remove("movie_embeddings.pkl")
    initialize_recommendation_system(db)
    return {"status": "success"}


@app.post("/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(email=user.email, hashed_password=auth.hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "access_token": auth.create_access_token(data={"sub": new_user.email}),
        "token_type": "bearer",
    }


@app.post("/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": auth.create_access_token(data={"sub": user.email}),
        "token_type": "bearer",
    }


# Password Reset Endpoints
@app.post("/auth/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """
    Generate a password reset token for the user.
    In production, this would send an email with the reset link.
    """
    user = db.query(User).filter(User.email == email).first()

    # Don't reveal if email exists (security best practice)
    if not user:
        return {
            "message": "If an account exists with this email, you will receive password reset instructions."
        }

    # Generate a secure random token
    reset_token = secrets.token_urlsafe(32)

    # Store token with expiration (15 minutes)
    reset_tokens[reset_token] = {
        "email": email,
        "expires_at": datetime.now() + timedelta(minutes=15),
    }
    print(f"Reset token for {email}: {reset_token}")

    return {
        "message": "If an account exists with this email, you will receive password reset instructions.",
        "reset_token": reset_token,
    }


@app.post("/auth/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """
    Reset password using the provided token.
    """
    # Check if token exists and is valid
    if token not in reset_tokens:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    token_data = reset_tokens[token]

    # Check if token has expired
    if datetime.now() > token_data["expires_at"]:
        del reset_tokens[token]
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Find user
    user = db.query(User).filter(User.email == token_data["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update password
    user.hashed_password = auth.hash_password(new_password)
    db.commit()

    # Delete used token
    del reset_tokens[token]

    return {"message": "Password has been reset successfully"}


@app.post("/movies/favorite/{movie_id}")
def toggle_favorite(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    # 1. Check if movie exists
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # 2. Check if already favorited
    existing_fav = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.movie_id == movie_id)
        .first()
    )

    if existing_fav:
        db.delete(existing_fav)
        db.commit()
        return {"status": "removed", "message": "Removed from favorites"}

    # 3. Add to favorites
    new_fav = Favorite(user_id=current_user.id, movie_id=movie_id)
    db.add(new_fav)
    db.commit()
    return {"status": "added", "message": "Added to favorites"}


@app.get("/movies/{movie_id}")
def get_movie_by_id(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@app.get("/movies/similar/{movie_id}")
def get_similar_movies(
    movie_id: int, limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)
):
    global movie_embeddings, movie_id_to_index, index_to_movie_id

    if movie_embeddings is None:
        initialize_recommendation_system(db)

    if movie_id not in movie_id_to_index:
        raise HTTPException(status_code=404, detail="Movie not found in index")

    movie_idx = movie_id_to_index[movie_id]

    # FIX: Reshape 1D vector to 2D (1, 384) for Scikit-Learn compatibility
    movie_emb = movie_embeddings[movie_idx].reshape(1, -1)
    similarities = cosine_similarity(movie_emb, movie_embeddings)[0]

    # Get top N similar (skip index 0 as it is the movie itself)
    top_indices = np.argsort(similarities)[::-1][1 : limit + 1]
    similar_movie_ids = [index_to_movie_id[idx] for idx in top_indices]

    movies_list = db.query(Movie).filter(Movie.id.in_(similar_movie_ids)).all()
    movie_dict = {m.id: m for m in movies_list}
    sorted_movies = [movie_dict[mid] for mid in similar_movie_ids if mid in movie_dict]

    return {"similar_movies": sorted_movies}

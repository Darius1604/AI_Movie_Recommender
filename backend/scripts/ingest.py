import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv
from database import SessionLocal
from models import Movie, MovieCategory

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")

CATEGORY_LIMITS = {"now_playing": 10, "popular": 100, "top_rated": 450, "upcoming": 10}


def get_http_session():
    """Creates a requests session with automatic retries."""
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=1,  # Waits 1s, 2s, 4s... between retries
        status_forcelist=[429, 500, 502, 503, 504],
    )
    session.mount("https://", HTTPAdapter(max_retries=retries))
    return session


def ingest_movies():
    print("Starting ingestion...")
    db = SessionLocal()
    http = get_http_session()  # Use one session for all network calls

    try:
        for category, max_pages in CATEGORY_LIMITS.items():
            print(f"\nCategory: {category}")
            for page in range(1, max_pages + 1):
                url = f"https://api.themoviedb.org/3/movie/{category}"
                params = {"api_key": API_KEY, "language": "en-US", "page": page}

                try:
                    response = http.get(url, params=params)
                    response.raise_for_status()
                    movies_list = response.json().get("results", [])

                    for movie_data in movies_list:
                        tmdb_id = movie_data["id"]
                        movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()

                        # Fetch details if new or missing runtime
                        if not movie or movie.runtime is None:
                            detail_url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
                            d_resp = http.get(detail_url, params={"api_key": API_KEY})

                            runtime = None
                            if d_resp.status_code == 200:
                                runtime = d_resp.json().get("runtime")

                        if not movie:
                            movie = Movie(
                                tmdb_id=tmdb_id,
                                title=movie_data["title"],
                                overview=movie_data["overview"],
                                genres=movie_data["genre_ids"],
                                poster_path=movie_data.get("poster_path"),
                                backdrop_path=movie_data.get("backdrop_path"),
                                popularity=movie_data.get("popularity"),
                                vote_average=movie_data.get("vote_average"),
                                vote_count=movie_data.get("vote_count"),
                                release_date=movie_data.get("release_date") or None,
                                runtime=runtime,
                            )
                            db.add(movie)
                        else:
                            movie.runtime = runtime

                        db.flush()  # Sync so we have movie.id for the mapping

                        # Category Mapping
                        existing_link = (
                            db.query(MovieCategory)
                            .filter_by(movie_id=movie.id, category_name=category)
                            .first()
                        )

                        if not existing_link:
                            db.add(
                                MovieCategory(movie_id=movie.id, category_name=category)
                            )

                    db.commit()  # Commit once per page
                    print(f"Processed page {page}/{max_pages}")

                except Exception as e:
                    db.rollback()
                    print(f"Failed on page {page}: {e}")

    finally:
        http.close()
        db.close()
        print("\nIngestion completed!")


if __name__ == "__main__":
    ingest_movies()

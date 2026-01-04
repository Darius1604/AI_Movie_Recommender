import os
import requests
import time
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Movie, MovieCategory

load_dotenv()
API_key = os.getenv("TMDB_API_KEY")

category_limits = {"now_playing": 10, "popular": 100, "top_rated": 450, "upcoming": 10}


def ingest_movies():
    print("Starting ingestion ...")
    for category, max_pages in category_limits.items():
        print(f"Ingesting category: {category}")
        for page in range(1, max_pages + 1):
            url = f"https://api.themoviedb.org/3/movie/{category}?api_key={API_key}&language=en-US&page={page}"

            try:
                response = requests.get(url)
                if response.status_code != 200:
                    print(f"Error on page {page}: {response.status_code}")
                    continue

                movies_list = response.json().get("results", [])

                db = SessionLocal()
                for movie_data in movies_list:
                    tmdb_id = movie_data["id"]

                    # Check if the movie already exists
                    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
                    if not movie:
                        movie = Movie(
                            tmdb_id=tmdb_id,
                            title=movie_data["title"],
                            overview=movie_data["overview"],
                            genres=movie_data["genre_ids"],
                            poster_path=movie_data["poster_path"],
                            backdrop_path=movie_data.get("backdrop_path"),
                            popularity=movie_data["popularity"],
                            vote_average=movie_data.get("vote_average"),
                            vote_count=movie_data.get("vote_count"),
                            release_date=movie_data.get("release_date") or None,
                            trailer_key=None,
                        )
                        db.add(movie)
                        db.flush()

                    existing_link = (
                        db.query(MovieCategory)
                        .filter_by(movie_id=movie.id, category_name=category)
                        .first()
                    )

                    if not existing_link:
                        new_link = MovieCategory(
                            movie_id=movie.id, category_name=category
                        )
                        db.add(new_link)
                db.commit()
                db.close()
                print(f"Page {page} of {category} processed")
                time.sleep(0.2)

            except Exception as e:
                print(f"Failed on page {page}: {e}")
        print("Ingestion completed!")


if __name__ == "__main__":
    ingest_movies()

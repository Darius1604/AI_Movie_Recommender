import os
import requests
import time
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models import SessionLocal, Movie

load_dotenv()
API_key = os.getenv("TMDB_API_KEY")


def ingest_movies():
    db: Session = SessionLocal()
    print("Starting ingestion ...")
    for page in range(1, 501):
        url = f"https://api.themoviedb.org/3/movie/top_rated?api_key={API_key}&language=en-US&page={page}"

        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Error on page {page}: {response.status_code}")
                continue

            data = response.json()
            movies_list = data.get("results", [])

            for movie_data in movies_list:
                # Check if the movie already exists to avoid duplicates
                existing_movie = (
                    db.query(Movie).filter(Movie.tmdb_id == movie_data["id"]).first()
                )
                if existing_movie:
                    continue

                # Create the Movie object
                new_movie = Movie(
                    tmdb_id=movie_data["id"],
                    title=movie_data["title"],
                    overview=movie_data["overview"],
                    genres=movie_data["genre_ids"],  # Stored as JSON
                    poster_path=movie_data["poster_path"],
                    popularity=movie_data["popularity"],
                    release_date=movie_data.get("release_date") or None,
                )

                db.add(new_movie)

            db.commit()
            print(f"Page {page} processed")

            time.sleep(0.1)
        except Exception as e:
            print(f"Failed on page {page}: {e}")
            db.rollback()  # Undo changes if crash occurs

    db.close()
    print("Ingestion completed!")


if __name__ == "__main__":
    ingest_movies()

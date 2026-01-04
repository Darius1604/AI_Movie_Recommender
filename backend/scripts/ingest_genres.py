import os
import requests
from dotenv import load_dotenv
from backend.database import SessionLocal
from backend.models import Genre

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")


def ingest_genres():
    url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={API_KEY}&language=en-US"

    print("Fetching genres from TMDB...")
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        return

    genres_data = response.json().get("genres", [])

    db = SessionLocal()
    try:
        for item in genres_data:
            # Check if genre already exists to avoid duplicates
            existing_genre = db.query(Genre).filter(Genre.id == item["id"]).first()

            if not existing_genre:
                new_genre = Genre(id=item["id"], name=item["name"])
                db.add(new_genre)
                print(f"Added: {item['name']}")
            else:
                print(f"Skipping: {item['name']} (already exists)")

        db.commit()
        print("Genre ingestion completed!")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    ingest_genres()

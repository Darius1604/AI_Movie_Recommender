import os, time, requests
from dotenv import load_dotenv
from database import SessionLocal
from models import Movie

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")


def enrich_trailers():
    db = SessionLocal()
    # Fetch all movies missing keys at once so we don't keep querying the DB
    movies = db.query(Movie).filter(Movie.trailer_key == None).all()
    print(f"Processing {len(movies)} movies. Go grab a coffee!")

    for movie in movies:
        url = f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}/videos?api_key={API_KEY}"
        try:
            response = requests.get(url, timeout=5)

            if response.status_code == 200:
                videos = response.json().get("results", [])
                # Default to N/A if no trailer is found
                movie.trailer_key = next(
                    (
                        v["key"]
                        for v in videos
                        if v["site"] == "YouTube" and v["type"] == "Trailer"
                    ),
                    "N/A",
                )
            elif response.status_code == 429:
                print("Rate limit! Sleeping 10s...")
                time.sleep(10)
                continue
            else:
                movie.trailer_key = "N/A"

            db.commit()
            print(f"Done: {movie.title}")
            time.sleep(0.25)  # Safe pace

        except Exception as e:
            print(f"Error for {movie.title}: {e}")
            db.rollback()

    db.close()


if __name__ == "__main__":
    enrich_trailers()

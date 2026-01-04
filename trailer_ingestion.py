import asyncio
import httpx
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Movie
import os

API_KEY = os.getenv("TMDB_API_KEY")
MAX_CONCURRENT_REQUESTS = 5  


async def fetch_trailer(client, movie, semaphore):
    async with semaphore:
        url = f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}/videos?api_key={API_KEY}"
        try:
            response = await client.get(url, timeout=httpx.Timeout(5.0, connect=2.0))

            if response.status_code == 200:
                videos = response.json().get("results", [])
                for v in videos:
                    if v["site"] == "YouTube" and v["type"] == "Trailer":
                        return movie.id, v["key"]
                return movie.id, "N/A"

            elif response.status_code == 429:
                print("!! Rate limit hit !!")
                return movie.id, "RETRY"

            return movie.id, "N/A"
        except Exception:
            return movie.id, None 


async def enrich_trailers():
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    while True:
        db = SessionLocal()
        movies_to_update = (
            db.query(Movie).filter(Movie.trailer_key == None).limit(40).all()
        )

        if not movies_to_update:
            print("All movies in database have been processed!")
            db.close()
            break

        print(f"Processing batch of {len(movies_to_update)} movies...")

        async with httpx.AsyncClient() as client:
            tasks = [fetch_trailer(client, m, semaphore) for m in movies_to_update]
            results = await asyncio.gather(*tasks)

            for movie_id, key in results:
                if key == "RETRY":
                    continue
                if key:
                    db.query(Movie).filter(Movie.id == movie_id).update(
                        {"trailer_key": key}
                    )

            db.commit()
        db.close()
        await asyncio.sleep(2)


if __name__ == "__main__":
    try:
        asyncio.run(enrich_trailers())
    except KeyboardInterrupt:
        print("\nManual stop. Progress saved.")

import requests

url = "https://api.themoviedb.org/3/authentication"

headers = {
    "accept": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlOGY2MmZhZGUyMTJkYmJjZWM0ZmM3ZTRkODg0YTVlZCIsIm5iZiI6MTc2NDkzNjI3Ni4xNjEsInN1YiI6IjY5MzJjYTU0ZWIwYjUwNGMxODQ3NjUwYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a-A1Vqc_iiHy4reJUxEtuYt8EZ64oe5TrjSHH9aWFQ0",
}

response = requests.get(url, headers=headers)

print(response.text)

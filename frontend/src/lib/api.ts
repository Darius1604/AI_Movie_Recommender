import { Movie } from "@/types/movie";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getMovies(category: string): Promise<Movie[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/movies/${category}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch ${category}`);
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export async function getGenreDiscovery() {
  const res = await fetch(`${API_BASE_URL}/movies/genre-discovery`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export const getPosterUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w1280${path}` : "/placeholder.png";

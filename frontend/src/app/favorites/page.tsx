"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SimpleNavbar from "@/Components/SimpleNavbar";
import MovieCard from "@/Components/MovieCard";
import { Movie } from "@/types/movie";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsLoggedIn(true);
    fetchFavorites();
  }, [router]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Fetching favorites with token:",
        token ? "exists" : "missing"
      );

      const response = await fetch("http://localhost:8000/movies/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Favorites data:", data);
        setFavorites(data.favorites || []);
      } else if (response.status === 401) {
        console.log("Unauthorized - redirecting to login");
        router.push("/login");
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-brand-bg text-white pb-20">
      <SimpleNavbar />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-zinc-400 text-sm">
            {favorites.length} {favorites.length === 1 ? "movie" : "movies"}{" "}
            saved
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-brand-surface rounded-3xl" />
                <div className="mt-4 h-4 bg-brand-surface rounded" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-brand-surface rounded-full mb-6">
              <Heart size={48} className="text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-zinc-400 mb-6">
              Start adding movies to your favorites collection
            </p>
            <button
              onClick={() => router.push("/home")}
              className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full text-black font-bold hover:scale-105 transition-transform"
            >
              Explore Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

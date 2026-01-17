"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Movie } from "@/types/movie";
import { getPosterUrl } from "@/lib/api";
import { Star, Heart } from "lucide-react";
import MovieModal from "./MovieModal";

export default function MovieCard({
  movie,
  priority = false,
}: {
  movie: Movie;
  priority?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);

    // Check if movie is already favorited
    if (token) {
      checkFavoriteStatus();
    }
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/movies/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isFav = data.favorites.some((fav: Movie) => fav.id === movie.id);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening

    if (!isLoggedIn) {
      alert("Please log in to add favorites");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/movies/favorite/${movie.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.status === "added");
      } else if (response.status === 401) {
        alert("Please log in to add favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative flex z-10 hover:z-50 flex-col transition-all duration-500 hover:-translate-y-3 cursor-pointer select-none w-full"
      >
        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-3xl bg-brand-surface ring-1 ring-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(var(--brand-primary-rgb),0.4)] hover:ring-brand-primary/60">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-surface via-brand-bg to-brand-surface animate-pulse" />
          )}

          <Image
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className={`object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />

          {/* Favorite Button */}
          {isLoggedIn && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-black/80 z-10"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={20}
                className={`transition-all duration-300 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-white hover:text-red-400"
                }`}
              />
            </button>
          )}

          {/* Rating Badge */}
          {movie.vote_average && (
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-4 px-1 text-sm font-bold text-white group-hover:text-brand-primary transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
          {movie.title}
        </h3>
      </div>

      <MovieModal
        movie={movie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

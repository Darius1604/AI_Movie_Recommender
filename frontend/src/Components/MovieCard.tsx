"use client";

import { useState } from "react";
import Image from "next/image";
import { Movie } from "@/types/movie";
import { getPosterUrl } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { Star, Clock, Calendar } from "lucide-react";
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
            priority={priority} // Use the priority prop
            loading={priority ? "eager" : "lazy"} // Eager load priority images
          />
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

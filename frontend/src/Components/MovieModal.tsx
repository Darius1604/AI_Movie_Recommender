"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Star,
  Clock,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Movie } from "@/types/movie";
import { getPosterUrl } from "@/lib/api";
import { formatDuration } from "@/lib/utils";

interface MovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieModal({
  movie,
  isOpen,
  onClose,
}: MovieModalProps) {
  const [activeMovie, setActiveMovie] = useState<Movie>(movie);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [mounted, setMounted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recommendationsScrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0); // Track scroll position to prevent jump

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveMovie(movie);
    }
  }, [isOpen, movie]);

  useEffect(() => {
    if (isOpen) {
      // 1. Save the current scroll position
      scrollPositionRef.current = window.scrollY;

      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // 2. Lock the body but keep the visual position
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      // Fetch recommendations
      fetch(`http://localhost:8000/movies/${activeMovie.id}/recommendations`)
        .then((res) => res.json())
        .then((data) => setRecommendations(data.slice(0, 12)))
        .catch((err) => console.error("Error fetching recommendations:", err));

      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
    } else {
      // 3. Reset body styles and restore scroll position
      const scrollY = scrollPositionRef.current;

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";

      window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen, activeMovie.id]);

  const getYouTubeEmbedUrl = (trailerKey: string | null) => {
    if (!trailerKey) return undefined;
    return `https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0&modestbranding=1`;
  };

  const scrollRecommendations = (direction: "left" | "right") => {
    if (recommendationsScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? recommendationsScrollRef.current.scrollLeft - scrollAmount
          : recommendationsScrollRef.current.scrollLeft + scrollAmount;

      recommendationsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <div
        ref={scrollContainerRef}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-zinc-900 to-black rounded-3xl shadow-2xl border border-white/10 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 transition-all duration-300 hover:scale-110"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Hero Section */}
        <div className="relative h-[50vh] w-full overflow-hidden rounded-t-3xl">
          <Image
            src={
              activeMovie.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${activeMovie.backdrop_path}`
                : getPosterUrl(activeMovie.poster_path)
            }
            alt={activeMovie.title}
            fill
            priority
            quality={90}
            className="object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-zinc-900/80" />

          <div className="absolute inset-0 flex items-end p-8">
            <div className="flex flex-col md:flex-row gap-6 w-full">
              <div className="flex-shrink-0">
                <div className="relative w-48 h-72 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
                  <Image
                    src={getPosterUrl(activeMovie.poster_path)}
                    alt={activeMovie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {activeMovie.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Star
                      size={16}
                      className="fill-brand-primary text-brand-primary"
                    />
                    <span className="font-bold text-white">
                      {activeMovie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  {activeMovie.runtime && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <Clock size={16} className="text-brand-secondary" />
                      <span className="font-semibold text-white">
                        {formatDuration(activeMovie.runtime)}
                      </span>
                    </div>
                  )}
                  {activeMovie.release_date && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <Calendar size={16} className="text-zinc-400" />
                      <span className="font-semibold text-white">
                        {activeMovie.release_date.split("-")[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* YouTube Trailer */}
          {activeMovie.trailer_key && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Trailer</h3>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 ring-1 ring-white/10">
                <iframe
                  key={activeMovie.trailer_key}
                  src={getYouTubeEmbedUrl(activeMovie.trailer_key)}
                  title={`${activeMovie.title} Trailer`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
            <p className="text-zinc-300 leading-relaxed">
              {activeMovie.overview || "No overview available."}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-xs text-zinc-500 mb-1">Rating</p>
              <p className="text-lg font-bold text-white">
                {activeMovie.vote_average.toFixed(1)}/10
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-xs text-zinc-500 mb-1">Votes</p>
              <p className="text-lg font-bold text-white">
                {activeMovie.vote_count.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-xs text-zinc-500 mb-1">Popularity</p>
              <p className="text-lg font-bold text-white">
                {activeMovie.popularity.toFixed(0)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-xs text-zinc-500 mb-1">Year</p>
              <p className="text-lg font-bold text-white">
                {activeMovie.release_date?.split("-")[0]}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                You Might Also Like
              </h3>
              <div className="relative group">
                <button
                  onClick={() => scrollRecommendations("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/80 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all -translate-x-1/2"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>

                <div
                  ref={recommendationsScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-4"
                  style={{ scrollbarWidth: "none" }}
                >
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex-shrink-0 w-[150px] snap-start cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setActiveMovie(rec)}
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/10">
                        <Image
                          src={getPosterUrl(rec.poster_path)}
                          alt={rec.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollRecommendations("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/80 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all translate-x-1/2"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

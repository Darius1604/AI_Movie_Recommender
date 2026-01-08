"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Zap,
  Coffee,
  Brain,
  Smile,
  Laugh,
  Frown,
  Angry,
  PartyPopper,
  Moon,
} from "lucide-react";
import MovieGrid from "@/Components/MovieGrid";
import { Movie } from "@/types/movie";

const moods = [
  {
    id: "happy",
    label: "Happy",
    icon: Smile,
    color: "from-yellow-400 to-orange-400",
    genres: [35, 10751, 16],
  }, // Comedy, Family, Animation
  {
    id: "excited",
    label: "Excited",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    genres: [28, 12, 878],
  }, // Action, Adventure, Sci-Fi
  {
    id: "relaxed",
    label: "Relaxed",
    icon: Coffee,
    color: "from-green-400 to-teal-400",
    genres: [10749, 35, 10402],
  }, // Romance, Comedy, Music
  {
    id: "thoughtful",
    label: "Thoughtful",
    icon: Brain,
    color: "from-blue-400 to-indigo-500",
    genres: [18, 36, 99],
  }, // Drama, History, Documentary
  {
    id: "romantic",
    label: "Romantic",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    genres: [10749, 18],
  }, // Romance, Drama
  {
    id: "adventurous",
    label: "Adventurous",
    icon: PartyPopper,
    color: "from-orange-400 to-red-500",
    genres: [12, 14, 28],
  }, // Adventure, Fantasy, Action
  {
    id: "sad",
    label: "Need Cheering Up",
    icon: Frown,
    color: "from-blue-300 to-purple-400",
    genres: [35, 16, 10751],
  }, // Comedy, Animation, Family
  {
    id: "intense",
    label: "Want Intensity",
    icon: Angry,
    color: "from-red-500 to-orange-600",
    genres: [53, 80, 28],
  }, // Thriller, Crime, Action
  {
    id: "silly",
    label: "Silly & Fun",
    icon: Laugh,
    color: "from-yellow-300 to-pink-400",
    genres: [35, 16, 10770],
  }, // Comedy, Animation, TV Movie
  {
    id: "sleepy",
    label: "Before Sleep",
    icon: Moon,
    color: "from-indigo-400 to-purple-600",
    genres: [16, 14, 10751],
  }, // Animation, Fantasy, Family
  {
    id: "inspired",
    label: "Need Inspiration",
    icon: Sparkles,
    color: "from-cyan-400 to-blue-500",
    genres: [18, 36, 10752],
  }, // Drama, History, War
];

export default function DiscoverPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMoodSelect = async (mood: (typeof moods)[0]) => {
    setSelectedMood(mood.id);
    setLoading(true);

    try {
      // Fetch movies for each genre and combine results
      const genrePromises = mood.genres.map((genreId) =>
        fetch(`http://localhost:8000/movies/genre/${genreId}`).then((res) =>
          res.json()
        )
      );

      const results = await Promise.all(genrePromises);

      // Combine and deduplicate movies
      const allMovies: Movie[] = [];
      const seenIds = new Set<number>();

      results.forEach((result) => {
        if (result.movies && Array.isArray(result.movies)) {
          result.movies.forEach((movie: Movie) => {
            if (!seenIds.has(movie.id)) {
              seenIds.add(movie.id);
              allMovies.push(movie);
            }
          });
        }
      });

      // Sort by popularity and take top 20
      const sortedMovies = allMovies
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);

      setMovies(sortedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-brand-bg py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Home</span>
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <Sparkles size={28} className="text-black" />
              </div>
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-brand-primary to-brand-secondary bg-clip-text text-transparent">
              How Are You Feeling?
            </h1>
            <p className="text-zinc-400 text-lg">
              Select your mood and we'll recommend the perfect movies for you
            </p>
          </div>
        </div>
      </div>

      {/* Mood Selection */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;

            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-brand-primary bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 scale-105 shadow-lg shadow-brand-primary/30"
                    : "border-white/10 bg-zinc-900/50 hover:border-brand-primary/50 hover:bg-zinc-900 hover:scale-105"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mood.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>
                  <span
                    className={`font-bold text-center transition-colors ${
                      isSelected
                        ? "text-brand-primary"
                        : "text-white group-hover:text-brand-primary"
                    }`}
                  >
                    {mood.label}
                  </span>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                    <span className="text-black text-sm">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movies Grid */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-brand-primary/30 border-t-brand-primary animate-spin" />
            <p className="text-zinc-400 font-medium">
              Finding perfect movies for you...
            </p>
          </div>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Movies for{" "}
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                {moods.find((m) => m.id === selectedMood)?.label}
              </span>
            </h2>
            <p className="text-zinc-400">
              We found {movies.length} movies that match your mood
            </p>
          </div>
          <MovieGrid movies={movies} />
        </div>
      )}

      {!loading && !selectedMood && (
        <div className="text-center py-20 text-zinc-500">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a mood above to discover movies</p>
        </div>
      )}
    </main>
  );
}

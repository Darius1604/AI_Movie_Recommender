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
  Search,
} from "lucide-react";
import MovieGrid from "@/Components/MovieGrid";
import { Movie } from "@/types/movie";

const moods = [
  {
    id: "happy",
    label: "Happy",
    icon: Smile,
    color: "from-yellow-400 to-orange-400",
  },
  {
    id: "excited",
    label: "Excited",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "relaxed",
    label: "Relaxed",
    icon: Coffee,
    color: "from-green-400 to-teal-400",
  },
  {
    id: "thoughtful",
    label: "Thoughtful",
    icon: Brain,
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "adventurous",
    label: "Adventurous",
    icon: PartyPopper,
    color: "from-orange-400 to-red-500",
  },
  {
    id: "sad",
    label: "Need Cheering Up",
    icon: Frown,
    color: "from-blue-300 to-purple-400",
  },
  {
    id: "intense",
    label: "Want Intensity",
    icon: Angry,
    color: "from-red-500 to-orange-600",
  },
  {
    id: "silly",
    label: "Silly & Fun",
    icon: Laugh,
    color: "from-yellow-300 to-pink-400",
  },
  {
    id: "sleepy",
    label: "Before Sleep",
    icon: Moon,
    color: "from-indigo-400 to-purple-600",
  },
  {
    id: "inspired",
    label: "Need Inspiration",
    icon: Sparkles,
    color: "from-cyan-400 to-blue-500",
  },
];

export default function DiscoverPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/movies/recommend?mood=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      if (data.movies) setMovies(data.movies);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (moodId: string, moodLabel: string) => {
    setSelectedMood(moodId);
    setCustomQuery("");
    fetchRecommendations(moodLabel);
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setSelectedMood(null);
    fetchRecommendations(customQuery);
  };

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-brand-bg py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Home</span>
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg mx-auto mb-6">
              <Sparkles size={28} className="text-black" />
            </div>

            {/* FIXED: Added leading-tight and py-2 to prevent title cropping */}
            <h1 className="text-5xl md:text-6xl font-black leading-tight py-2 mb-4 bg-gradient-to-r from-white via-brand-primary to-brand-secondary bg-clip-text text-transparent">
              How Are You Feeling?
            </h1>

            <p className="text-zinc-400 text-lg mb-8">
              Select a mood or describe your vibe in your own words.
            </p>

            <form
              onSubmit={handleCustomSearch}
              className="relative max-w-xl mx-auto"
            >
              <input
                type="text"
                placeholder="e.g. A rainy day mystery in London..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 px-6 pl-12 focus:outline-none focus:border-brand-primary transition-all text-white placeholder:text-zinc-500"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={20}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary text-black px-4 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Find
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mood Selection Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;

            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id, mood.label)}
                /* FIXED: Added Purple Glow and better transitions matching MovieCard style */
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-500 ${
                  isSelected
                    ? "border-purple-500/60 bg-zinc-900/80 scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)] ring-1 ring-purple-500/40"
                    : "border-white/5 bg-zinc-900/50 hover:border-brand-primary/30"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <span
                    className={`font-bold transition-colors duration-300 ${
                      isSelected
                        ? "text-purple-400"
                        : "text-white group-hover:text-brand-primary"
                    }`}
                  >
                    {mood.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-zinc-400">Consulting the AI...</p>
          </div>
        ) : movies.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-8">
              Recommendations for{" "}
              <span className="text-brand-primary">
                "
                {selectedMood
                  ? moods.find((m) => m.id === selectedMood)?.label
                  : customQuery}
                "
              </span>
            </h2>
            <MovieGrid movies={movies} />
          </>
        ) : (
          !loading && (
            <div className="text-center py-20 text-zinc-600">
              <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
              <p>Pick a vibe to see what we find.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}

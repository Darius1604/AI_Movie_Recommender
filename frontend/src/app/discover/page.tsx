"use client";

import { useState, useRef, useEffect } from "react";
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
  Cpu,
  X,
  Ghost,
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
  {
    id: "mysterious",
    label: "Mysterious",
    icon: Ghost, // Add Ghost to your lucide-react imports
    color: "from-slate-600 to-indigo-900",
  },
];

export default function DiscoverPage() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [customQuery, setCustomQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [similarityScores, setSimilarityScores] = useState<number[]>([]);
  const [lastSearched, setLastSearched] = useState("");

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (movies.length > 0 && !loading) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [movies, loading]);

  const fetchRecommendations = async (query: string) => {
    setLoading(true);
    setLastSearched(query);
    try {
      const response = await fetch(
        `http://localhost:8000/movies/ai-recommend?query=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      if (data.results) {
        setMovies(data.results);
        setSimilarityScores(data.similarity_scores || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    if (customQuery) setCustomQuery("");
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((id) => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleFind = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let finalQuery = "";
    if (customQuery.trim()) {
      finalQuery = customQuery;
    } else if (selectedMoods.length > 0) {
      finalQuery = selectedMoods
        .map((id) => moods.find((m) => m.id === id)?.label)
        .join(" and ");
    }
    if (finalQuery) fetchRecommendations(finalQuery);
  };

  const clearAll = () => {
    setCustomQuery("");
    setSelectedMoods([]);
    setMovies([]);
    setSimilarityScores([]);
    setLastSearched("");
  };

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-brand-bg py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* FIXED: Removed text-center from this wrapper so Link stays left */}
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

          {/* FIXED: Added text-center specifically to this inner content wrapper */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg mx-auto mb-6">
              <Cpu size={28} className="text-black" />
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight py-2 mb-4 bg-gradient-to-r from-white via-brand-primary to-brand-secondary bg-clip-text text-transparent">
              How Are You Feeling?
            </h1>

            <p className="text-zinc-400 text-lg mb-8">
              Describe your vibe or search for exactly what you want
            </p>

            <form
              onSubmit={handleFind}
              className="relative max-w-xl mx-auto mb-4"
            >
              <input
                type="text"
                placeholder="e.g. A high-stakes heist where everything goes wrong..."
                value={customQuery}
                onChange={(e) => {
                  setCustomQuery(e.target.value);
                  if (e.target.value) setSelectedMoods([]);
                }}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 px-12 focus:outline-none focus:border-brand-primary transition-all text-white placeholder:text-zinc-500"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={20}
              />

              {(customQuery || selectedMoods.length > 0) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}

              <button
                type="submit"
                disabled={!customQuery && selectedMoods.length === 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary disabled:opacity-50 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Find
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mood Selection Grid ... remains the same ... */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
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
      <div
        ref={resultsRef}
        className="max-w-7xl mx-auto px-6 pb-20 scroll-mt-20"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-zinc-400">Consulting AI Embeddings...</p>
          </div>
        ) : movies.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-8">
              Recommendations for{" "}
              <span className="text-brand-primary">"{lastSearched}"</span>
            </h2>
            <MovieGrid movies={movies} />
          </>
        ) : (
          !loading && (
            <div className="text-center py-20 text-zinc-600">
              <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
              <p>Combine your moods and press Find to discover movies.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}

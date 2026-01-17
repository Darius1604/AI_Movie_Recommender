"use client";

import { useState, useEffect } from "react";
import MovieSlider from "./MovieSlider";
import { Movie } from "@/types/movie";

interface RecommendationGroup {
  base_movie: Movie;
  similar_movies: Movie[];
}

interface PersonalizedRecommendationsProps {
  isLoggedIn: boolean;
}

export default function PersonalizedRecommendations({
  isLoggedIn,
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    fetchPersonalizedRecommendations();
  }, [isLoggedIn]);

  const fetchPersonalizedRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        "http://localhost:8000/movies/personalized-recommendations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if not logged in or no recommendations
  if (!isLoggedIn || (!loading && recommendations.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-brand-surface animate-pulse rounded" />
          <div className="h-8 w-64 bg-brand-surface animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      {recommendations.map((rec, index) => (
        <MovieSlider
          key={rec.base_movie.id}
          movies={rec.similar_movies}
          title={`Because you liked "${rec.base_movie.title}"`}
          iconName="star"
        />
      ))}
    </>
  );
}

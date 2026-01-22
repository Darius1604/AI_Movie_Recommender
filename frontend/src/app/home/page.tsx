"use client";

import { useEffect, useState } from "react";
import { getMovies, getGenreDiscovery } from "@/lib/api";
import Navbar from "@/Components/Navbar";
import MovieSlider from "@/Components/MovieSlider";

interface RecommendationGroup {
  base_movie: {
    id: number;
    title: string;
  };
  similar_movies: any[];
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [genreSections, setGenreSections] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState<
    RecommendationGroup[]
  >([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Fetch all data
    fetchData(!!token);
  }, []);

  const fetchData = async (loggedIn: boolean) => {
    try {
      const dataPromises = [
        getMovies("trending"),
        getMovies("top-rated"),
        getMovies("new-releases"),
        getGenreDiscovery(),
      ];

      // Add personalized recommendations if logged in
      if (loggedIn) {
        dataPromises.push(fetchPersonalizedRecommendations());
      }

      const results = await Promise.all(dataPromises);

      setTrending(results[0]);
      setTopRated(results[1]);
      setNewReleases(results[2]);
      setGenreSections(results[3]);

      if (loggedIn && results[4]) {
        setPersonalizedRecs(results[4]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

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
        return data.recommendations || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      return [];
    }
  };

  const templates = [
    (genre: string) => `Popular in ${genre}`,
    (genre: string) => `Best of ${genre}`,
    (genre: string) => `Top ${genre} Picks`,
    (genre: string) => `${genre} Hits`,
    (genre: string) => `Must-Watch ${genre}`,
    (genre: string) => `Trending ${genre}`,
    (genre: string) => `Explore ${genre}`,
    (genre: string) => `Fan Favorite ${genre}`,
  ];

  const personalizedTemplates = [
    (title: string) => `Because you liked ${title}`,
    (title: string) => `More like ${title}`,
    (title: string) => `Similar to ${title}`,
    (title: string) => `If you enjoyed ${title}`,
    (title: string) => `Fans of ${title} also watched`,
    (title: string) => `Inspired by ${title}`,
  ];

  const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);
  const shuffledPersonalizedTemplates = [...personalizedTemplates].sort(
    () => Math.random() - 0.5
  );

  // Split genre sections to insert personalized recommendations
  const firstHalfGenres = genreSections.slice(
    0,
    Math.ceil(genreSections.length / 2)
  );
  const secondHalfGenres = genreSections.slice(
    Math.ceil(genreSections.length / 2)
  );

  return (
    <main className="min-h-screen bg-brand-bg text-white pb-20">
      <Navbar />

      <div className="max-w-350 mx-auto px-6 md:px-12 mt-8 relative z-20 space-y-4">
        {/* 1. Trending Now */}
        <MovieSlider movies={trending} title="Trending Now" iconName="flame" />

        {/* 2. First Personalized Recommendation (if available) */}
        {personalizedRecs[0] && (
          <MovieSlider
            movies={personalizedRecs[0].similar_movies}
            title={shuffledPersonalizedTemplates[0](
              personalizedRecs[0].base_movie.title
            )}
            iconName="star"
          />
        )}

        {/* 3. New Releases */}
        <MovieSlider
          movies={newReleases}
          title="New Releases"
          iconName="calendar"
        />

        {/* 4. First Half of Genre Sliders */}
        {firstHalfGenres.map((section: any, idx: number) => {
          const templateIndex = idx % shuffledTemplates.length;
          const dynamicTitle = shuffledTemplates[templateIndex](
            section.genre_name
          );

          return (
            <MovieSlider
              key={`genre-first-${idx}`}
              movies={section.movies}
              title={dynamicTitle}
              iconName="film"
            />
          );
        })}

        {/* 5. Second Personalized Recommendation (if available) */}
        {personalizedRecs[1] && (
          <MovieSlider
            movies={personalizedRecs[1].similar_movies}
            title={shuffledPersonalizedTemplates[1](
              personalizedRecs[1].base_movie.title
            )}
            iconName="star"
          />
        )}

        {/* 6. Top Rated */}
        <MovieSlider movies={topRated} title="Top Rated" iconName="star" />

        {/* 7. Second Half of Genre Sliders */}
        {secondHalfGenres.map((section: any, idx: number) => {
          const templateIndex =
            (idx + firstHalfGenres.length) % shuffledTemplates.length;
          const dynamicTitle = shuffledTemplates[templateIndex](
            section.genre_name
          );

          return (
            <MovieSlider
              key={`genre-second-${idx}`}
              movies={section.movies}
              title={dynamicTitle}
              iconName="film"
            />
          );
        })}
      </div>
    </main>
  );
}

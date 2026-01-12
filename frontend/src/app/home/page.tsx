import { getMovies, getGenreDiscovery } from "@/lib/api";
import Navbar from "@/Components/Navbar";
import MovieSlider from "@/Components/MovieSlider";

export default async function HomePage() {
  const [trending, topRated, newReleases, genreSections] = await Promise.all([
    getMovies("trending"),
    getMovies("top-rated"),
    getMovies("new-releases"),
    getGenreDiscovery(),
  ]);

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

  const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

  return (
    <main className="min-h-screen bg-brand-bg text-white pb-20">
      <Navbar />

      <div className="max-w-350 mx-auto px-6 md:px-12 mt-8 relative z-20 space-y-12">
        {/* Fixed Hero Sliders */}
        <MovieSlider movies={trending} title="Trending Now" iconName="flame" />
        <MovieSlider
          movies={newReleases}
          title="New Releases"
          iconName="calendar"
        />
        <MovieSlider movies={topRated} title="Top Rated" iconName="star" />

        {/* Dynamic Genre Sliders */}
        {genreSections.map((section: any, idx: number) => {
          // Use the shuffled array. Modulo handles cases where genre count > template count
          const templateIndex = idx % shuffledTemplates.length;
          const dynamicTitle = shuffledTemplates[templateIndex](
            section.genre_name
          );

          return (
            <MovieSlider
              key={idx}
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

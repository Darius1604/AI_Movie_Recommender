import { getMovies } from "@/lib/api";
import Navbar from "@/Components/Navbar";
import MovieSlider from "@/Components/MovieSlider";
export default async function HomePage() {
  const [trending, topRated] = await Promise.all([
    getMovies("trending"),
    getMovies("top-rated"),
  ]);

  return (
    <main className="min-h-screen bg-brand-bg text-white pb-20">
      <Navbar />

      <div className="max-w-350 mx-auto px-6 md:px-12 mt--12.5 relative z-20 space-y-0">
        <MovieSlider movies={trending} title="Trending Now" iconName="flame" />
        <MovieSlider movies={topRated} title="Top Rated" iconName="star" />
      </div>
    </main>
  );
}

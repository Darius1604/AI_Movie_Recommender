import { getMovies } from "@/lib/api";
import Navbar from "@/Components/Navbar";
import MovieSlider from "@/Components/MovieSlider";

export default async function HomePage() {
  const [trending, topRated, upcoming] = await Promise.all([
    getMovies("trending"),
    getMovies("top-rated"),
    getMovies("upcoming"),
  ]);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-[-50px] relative z-20 space-y-4">
        <MovieSlider movies={trending} title="Trending Now" emoji="🔥" />
        <MovieSlider movies={topRated} title="Top Rated" emoji="⭐" />
        <MovieSlider movies={upcoming} title="Coming Soon" emoji="📅" />
      </div>
    </main>
  );
}

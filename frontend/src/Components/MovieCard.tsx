import Image from "next/image";
import { Movie } from "@/types/movie";
import { getPosterUrl } from "@/lib/api";
import { formatDuration } from "@/lib/utils";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="group relative flex flex-col transition-all duration-500 hover:-translate-y-2">
      {/* The Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 ring-1 ring-white/5 shadow-2xl">
        <Image
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
        />

        {/* Hover overlay for description and stats */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
          <p className="mb-4 text-[10px] text-zinc-400 font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {movie.overview}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[9px] font-bold text-zinc-200">
            <span>🔅 {movie.vote_average.toFixed(1)}</span>
            <span>🕒 {formatDuration(movie.runtime)}</span>
            <span>📅 {movie.release_date?.split("-")[0]}</span>
          </div>
        </div>
      </div>
      <h3 className="mt-4 px-2 text-sm font-bold text-zinc-100 truncate">
        {movie.title}
      </h3>
    </div>
  );
}

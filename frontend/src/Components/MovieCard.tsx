import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/movie";
import { getPosterUrl } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { Star, Clock, Calendar } from "lucide-react";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.tmdb_id}`}>
      <div className="group relative flex z-10 hover:z-50 flex-col transition-all duration-500 hover:-translate-y-3 cursor-pointer select-none">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-brand-surface ring-1 ring-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(var(--brand-primary-rgb),0.4)] hover:ring-brand-primary/60">
          <Image
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          {/* Rating badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-brand-primary/30">
            <Star size={14} className="fill-brand-primary text-brand-primary" />
            <span className="text-white text-xs font-bold">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
          {/* Hover overlay for description and stats */}
          <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <p className="mb-3 text-xs text-zinc-300 leading-relaxed line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {movie.overview}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Clock size={12} />
                <span>{formatDuration(movie.runtime)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Calendar size={12} />
                <span>{movie.release_date?.split("-")[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-4 px-1 text-sm font-bold text-white group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
          {movie.title}
        </h3>
      </div>
    </Link>
  );
}

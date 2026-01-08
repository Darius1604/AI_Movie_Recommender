"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import MovieCard from "./MovieCard";
import { Movie } from "@/types/movie";
import { Flame, Star, Play, Calendar, LucideIcon } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface MovieSliderProps {
  movies: Movie[];
  title: string;
  iconName: string;
}

const iconMap: Record<string, LucideIcon> = {
  flame: Flame,
  star: Star,
  play: Play,
  calendar: Calendar,
};

export default function MovieSlider({
  movies,
  title,
  iconName,
}: MovieSliderProps) {
  const Icon = iconMap[iconName] || Star;
  return (
    <section className="py-8">
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-6 px-4 md:px-0">
        <Icon className="text-brand-primary" size={24} />
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
      </div>

      <div className="relative">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={20}
          slidesPerView={1.2}
          navigation
          freeMode={true}
          breakpoints={{
            640: { slidesPerView: 2.5 },
            768: { slidesPerView: 3.5 },
            1024: { slidesPerView: 4.5 },
            1280: { slidesPerView: 5.5 },
          }}
          className="movie-swiper overflow- slider-edge-mask"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id} className="pb-4">
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import MovieCard from "./MovieCard";
import { MovieCardSkeleton } from "./MovieCardSkeleton";
import { Movie } from "@/types/movie";
import { Flame, Star, Play, Calendar, Film, LucideIcon } from "lucide-react";
import "swiper/css/bundle";

interface MovieSliderProps {
  movies: Movie[];
  title: string;
  iconName: string;
  isModal?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  flame: Flame,
  star: Star,
  play: Play,
  calendar: Calendar,
  film: Film,
};

export default function MovieSlider({
  movies,
  title,
  iconName,
  isModal = false,
}: MovieSliderProps) {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const Icon = iconMap[iconName] || Star;

  // Determine if we should show skeletons
  const isLoading = !movies || movies.length === 0;

  return (
    <section className="py-6">
      <div className="flex items-center gap-3 mb-6 px-4 md:px-0">
        <Icon className="text-brand-primary" size={24} />
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
      </div>

      <div
        className={`relative slider-mask-container ${
          isAtStart ? "is-at-start" : ""
        } ${isAtEnd ? "is-at-end" : ""}`}
      >
        <Swiper
          modules={[Navigation, FreeMode]}
          slidesPerView={"auto"}
          spaceBetween={20}
          navigation
          freeMode={true}
          onProgress={(swiper, progress) => {
            setIsAtStart(progress <= 0);
            setIsAtEnd(progress >= 1);
          }}
          className={`movie-swiper ${
            isModal ? "modal-slider" : "page-slider"
          } !overflow-hidden z-10`}
        >
          {isLoading
            ? // Render 6 skeleton cards while loading
              Array.from({ length: 6 }).map((_, i) => (
                <SwiperSlide key={`skeleton-${i}`} className="!h-auto">
                  <MovieCardSkeleton />
                </SwiperSlide>
              ))
            : movies.map((movie, index) => (
                <SwiperSlide key={movie.id} className="!h-auto">
                  {/* Pass priority to the first few visible movies */}
                  <MovieCard movie={movie} priority={index < 5} />
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </section>
  );
}

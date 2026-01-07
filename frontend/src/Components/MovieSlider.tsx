"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import MovieCard from "./MovieCard";
import { Movie } from "@/types/movie";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface MovieSliderProps {
  movies: Movie[];
  title: string;
  emoji: string;
}

export default function MovieSlider({
  movies,
  title,
  emoji,
}: MovieSliderProps) {
  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6 px-4 md:px-0">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
      </div>

      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={20}
        slidesPerView={1.2} // Shows a peek of the next movie
        navigation
        freeMode={true}
        breakpoints={{
          640: { slidesPerView: 2.5 },
          768: { slidesPerView: 3.5 },
          1024: { slidesPerView: 4.5 },
          1280: { slidesPerView: 5.5 },
        }}
        className="movie-swiper"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id} className="pb-4">
            <MovieCard movie={movie} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string;
  genres: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  trailer_key: string | null;
}

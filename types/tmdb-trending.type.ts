export type TMDBTrendingMovieResponseData = {
  page: number;
  results: TMDBMovieTrending[];
  total_pages: number;
  total_results: number;
};

export type TMDBTrendingTVResponseData = {
  page: number;
  results: TMDBTVTrending[];
  total_pages: number;
  total_results: number;
};

export type TMDBMovieTrending = {
  backdrop_path: string;
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: string;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type TMDBTVTrending = {
  backdrop_path: string;
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: string;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
};

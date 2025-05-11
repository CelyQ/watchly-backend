import type {
  TMDBMovieTrending,
  TMDBTrendingMovieResponseData,
  TMDBTrendingTVResponseData,
  TMDBTVTrending,
} from "@/types/tmdb-trending.type.ts";
import { redis } from "@/lib/redis.ts";

export class TMDBClient {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = Deno.env.get("TMDB_API_KEY") || "";
  }

  async getTrendingMovies() {
    const cache = (await redis.get("tmdb_trending_movies")) as
      | TMDBMovieTrending[]
      | null
      | undefined;

    if (cache) return cache;

    const url = new URL("https://api.themoviedb.org/3/trending/movie/day");
    url.searchParams.set("api_key", this.apiKey);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(await response.text());
      throw new Error("Failed to fetch trending movies.");
    }

    const responseData =
      (await response.json()) as TMDBTrendingMovieResponseData;

    await redis.set(
      "tmdb_trending_movies",
      JSON.stringify(responseData.results),
      {
        ex: 60 * 60 * 24, // 1 day
      },
    );

    return responseData.results;
  }

  async getTrendingTV() {
    const cache = (await redis.get("tmdb_trending_tv")) as
      | TMDBTVTrending[]
      | null
      | undefined;

    if (cache) return cache;

    const url = new URL("https://api.themoviedb.org/3/trending/tv/day");
    url.searchParams.set("api_key", this.apiKey);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(await response.text());
      throw new Error("Failed to fetch trending tv.");
    }

    const responseData = (await response.json()) as TMDBTrendingTVResponseData;

    await redis.set(
      "tmdb_trending_tv",
      JSON.stringify(responseData.results),
      { ex: 60 * 60 * 24 },
    );

    return responseData.results;
  }
}

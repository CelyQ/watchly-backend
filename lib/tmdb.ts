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
    try {
      const cache = (await redis.get("tmdb_trending_movies")) as
        | TMDBMovieTrending[]
        | null
        | undefined;

      if (cache) return cache;

      const url = new URL("https://api.themoviedb.org/3/trending/movie/day");
      url.searchParams.set("api_key", this.apiKey);

      console.log("Fetching trending movies from TMDB:", url.toString());

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TMDB API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch trending movies: ${response.statusText}`,
        );
      }

      const responseData =
        (await response.json()) as TMDBTrendingMovieResponseData;

      console.log("TMDB trending movies response:", {
        total: responseData.total_results,
        page: responseData.page,
        results: responseData.results.length,
      });

      await redis.set(
        "tmdb_trending_movies",
        JSON.stringify(responseData.results),
        {
          ex: 60 * 60 * 24, // 1 day
        },
      );

      return responseData.results;
    } catch (error) {
      console.error("Error in getTrendingMovies:", error);
      throw error;
    }
  }

  async getTrendingTV() {
    try {
      const cache = (await redis.get("tmdb_trending_tv")) as
        | TMDBTVTrending[]
        | null
        | undefined;

      if (cache) return cache;

      const url = new URL("https://api.themoviedb.org/3/trending/tv/day");
      url.searchParams.set("api_key", this.apiKey);

      console.log("Fetching trending TV shows from TMDB:", url.toString());

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TMDB API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch trending TV shows: ${response.statusText}`,
        );
      }

      const responseData =
        (await response.json()) as TMDBTrendingTVResponseData;

      console.log("TMDB trending TV shows response:", {
        total: responseData.total_results,
        page: responseData.page,
        results: responseData.results.length,
      });

      await redis.set(
        "tmdb_trending_tv",
        JSON.stringify(responseData.results),
        { ex: 60 * 60 * 24 },
      );

      return responseData.results;
    } catch (error) {
      console.error("Error in getTrendingTV:", error);
      throw error;
    }
  }
}

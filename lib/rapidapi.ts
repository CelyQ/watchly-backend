import type {
  RapidAPIIMDBSearchResponseData,
  RapidAPIIMDBSearchResponseDataEntity,
} from "@/types/rapidapi.type.ts";
import { redis } from "@/lib/redis.ts";

export class RapidAPIClient {
  private readonly apiKey: string;
  private readonly apiHost: string;

  constructor() {
    this.apiKey = Deno.env.get("RAPID_API_KEY") || "";
    this.apiHost = Deno.env.get("RAPID_API_HOST") || "";
  }

  /**
   * Search for a movie or series on IMDb using RapidAPI
   * @param query - The query to search for
   * @param type - The type of search to perform
   * @param cacheKey - if provided it will be used to cache the result
   * @returns The movie or series data
   */
  async imdbSearch(
    query: string,
    type: "MOVIE" | "TV",
    cacheKey?: string,
  ): Promise<RapidAPIIMDBSearchResponseDataEntity | null> {
    if (cacheKey) {
      const cache = (await redis.get(`imdb_${type}_search_${cacheKey}`)) as
        | RapidAPIIMDBSearchResponseDataEntity
        | null
        | undefined;

      if (cache) return cache;
    }

    const url = new URL("https://imdb232.p.rapidapi.com/api/search");
    url.searchParams.set("count", "1");
    url.searchParams.set("type", type);
    url.searchParams.set("q", query);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": this.apiHost,
      },
    });

    if (response.status === 429) {
      throw new Error("Rate limit exceeded.");
    }

    if (!response.ok) {
      console.error(await response.text());
      throw new Error("Failed to fetch data from RapidAPI");
    }

    const { data } = (await response.json()) as RapidAPIIMDBSearchResponseData;
    const entity = data.mainSearch.edges[0].node.entity;

    if (cacheKey) {
      await redis.set(
        `imdb_${type}_search_${cacheKey}`,
        JSON.stringify(entity),
        {
          ex: 60 * 60 * 24, // 1 day
        },
      );
    }
    return entity;
  }
}

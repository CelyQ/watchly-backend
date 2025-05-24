import type {
  RapidAPIIMDBOverviewResponseData,
  RapidAPIIMDBSearchResponseData,
  RapidAPIIMDBSearchResponseDataEntity,
  RapidAPIIMDBTitleGetBaseResponseData,
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
   * @param params - Search parameters
   * @param params.query - The query to search for
   * @param params.type - The type of search to perform
   * @param params.cacheKey - if provided it will be used to cache the result
   * @param params.count - number of results to return (default: 1)
   * @returns The movie or series data
   */
  async imdbSearch({
    query,
    type,
    cacheKey,
    count = 1,
  }: {
    query: string;
    type: "MOVIE" | "TV";
    cacheKey?: string;
    count?: number;
  }): Promise<RapidAPIIMDBSearchResponseDataEntity[]> {
    if (cacheKey) {
      const cache = (await redis.get(`imdb_${type}_search_${cacheKey}`)) as
        | RapidAPIIMDBSearchResponseDataEntity[]
        | null
        | undefined;

      if (cache) return cache;
    }

    const url = new URL("https://imdb232.p.rapidapi.com/api/search");
    url.searchParams.set("count", count.toString());
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
      const errorText = await response.text();
      console.error("RapidAPI IMDB search error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        query,
        type,
      });
      return [];
    }

    const responseData = await response.json();
    console.log("IMDB Search Response:", {
      status: response.status,
      data: responseData,
    });

    // Check for API errors
    if (responseData.errors) {
      console.error("RapidAPI IMDB search errors:", {
        errors: responseData.errors,
        query,
        type,
      });
      return [];
    }

    const { data } = responseData as RapidAPIIMDBSearchResponseData;
    if (!data?.mainSearch?.edges) {
      console.error("Invalid response structure from RapidAPI IMDB search:", {
        data: responseData,
        query,
        type,
      });
      return [];
    }

    const edges = data.mainSearch.edges;
    const entities = edges?.map((edge) => edge.node.entity).filter((
      entity,
    ): entity is RapidAPIIMDBSearchResponseDataEntity => entity !== null) ??
      [];

    if (cacheKey && entities.length > 0) {
      await redis.set(
        `imdb_${type}_search_${cacheKey}`,
        JSON.stringify(entities),
        {
          ex: 60 * 60 * 24, // 1 day
        },
      );
    }

    console.log("IMDB Search Results:", {
      query,
      type,
      results: entities.length,
    });

    return entities;
  }

  async imdbSearchByImdbId(imdbId: string) {
    const getBaseUrl = new URL(
      "https://imdb232.p.rapidapi.com/api/title/get-base",
    );
    getBaseUrl.searchParams.set("tt", imdbId);

    const titlePromise = fetch(getBaseUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": this.apiHost,
      },
    }).then(async (res) => {
      const { data } =
        (await res.json()) as RapidAPIIMDBTitleGetBaseResponseData;
      return data.title;
    }).catch((err) => {
      console.error(err);
      throw new Error("Failed to fetch data from RapidAPI");
    });

    const overviewUrl = new URL(
      "https://imdb232.p.rapidapi.com/api/title/get-overview",
    );
    overviewUrl.searchParams.set("tt", imdbId);

    const overviewPromise = fetch(overviewUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": this.apiHost,
      },
    }).then(async (res) => {
      const { data } = (await res.json()) as RapidAPIIMDBOverviewResponseData;
      return data.title;
    }).catch((err) => {
      console.error(err);
      throw new Error("Failed to fetch data from RapidAPI");
    });

    const [title, overview] = await Promise.all([
      titlePromise,
      overviewPromise,
    ]);

    return {
      title,
      overview,
    };
  }
}

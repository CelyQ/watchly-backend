import { Hono } from "hono";
import { TMDBClient } from "@/lib/tmdb.ts";
import { RapidAPIClient } from "@/lib/rapidapi.ts";

export const tv = new Hono();

tv.get("/trending", async (c) => {
  try {
    const tmdbClient = new TMDBClient();
    const rapidAPIClient = new RapidAPIClient();

    const trending = await tmdbClient.getTrendingTV();
    console.log({ trendingTv: trending });

    const tvshows = await Promise.all(
      trending.map((trend) => {
        return rapidAPIClient.imdbSearch(
          trend.original_name,
          "TV",
          trend.id.toString(),
        );
      }),
    );

    console.log({ tvshows });
    return c.json({ tvshows }, 200);
  } catch (error) {
    console.log({ error });
    if (error instanceof Error && error.message === "Rate limit exceeded.") {
      return c.json({ error: "Rate limit exceeded." }, 429);
    }

    return c.json({ error: "Internal server error." }, 500);
  }
});

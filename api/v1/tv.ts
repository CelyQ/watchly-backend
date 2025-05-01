import { Hono } from "hono";
import { TMDBClient } from "@/lib/tmdb.ts";
import { RapidAPIClient } from "@/lib/rapidapi.ts";

export const tv = new Hono();

tv.get("/trending", async (c) => {
  try {
    const tmdbClient = new TMDBClient();
    const rapidAPIClient = new RapidAPIClient();

    const trending = await tmdbClient.getTrendingTV();

    const tvshows = await Promise.all(
      trending.map((trend) => {
        return rapidAPIClient.imdbSearch(
          trend.title,
          "TV",
          trend.id.toString(),
        );
      }),
    );

    // Return just the list of movies or whatever you want from the data
    return c.json({ tvshows });
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return c.json({ error: "Internal server error." }, 500);
  }
});

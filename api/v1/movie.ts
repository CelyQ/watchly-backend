import { Hono } from "hono";
import { RapidAPIClient } from "@/lib/rapidapi.ts";
import { TMDBClient } from "@/lib/tmdb.ts";

export const movie = new Hono();

movie.get("/trending", async (c) => {
  try {
    const tmdbClient = new TMDBClient();
    const rapidAPIClient = new RapidAPIClient();

    const trending = await tmdbClient.getTrendingMovies();

    const movies = await Promise.all(
      trending.map((trend) => {
        return rapidAPIClient.imdbSearch(
          trend.title,
          "MOVIE",
          trend.id.toString(),
        );
      }),
    );

    // Return just the list of movies or whatever you want from the data
    return c.json({ movies });
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded.") {
      return c.json({ error: "Rate limit exceeded." }, 429);
    }
    return c.json({ error: "Internal server error." }, 500);
  }
});

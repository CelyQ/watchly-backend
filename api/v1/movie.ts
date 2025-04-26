import { Hono } from "hono";
import { env } from "@/env.ts";

export const movie = new Hono();

const TMDB_TRENDING_URL =
  `https://api.themoviedb.org/3/trending/movie/day?api_key=${env.TMDB_API_KEY}`;

movie.get("/trending", async (c) => {
  try {
    const response = await fetch(TMDB_TRENDING_URL);

    if (!response.ok) {
      return c.json({ error: "Failed to fetch trending movies." }, 500);
    }

    const data = await response.json();

    // Return just the list of movies or whatever you want from the data
    return c.json({ trending: data.results });
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return c.json({ error: "Internal server error." }, 500);
  }
});

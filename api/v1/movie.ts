import { Hono } from "hono";
import { RapidAPIClient } from "@/lib/rapidapi.ts";
import { TMDBClient } from "@/lib/tmdb.ts";

import type { AuthContext } from "@/types/context.ts";
import { db } from "@/db/index.ts";
import { redis } from "@/lib/redis.ts";
import type { RapidAPIIMDBSearchResponseDataEntity } from "@/types/rapidapi.type.ts";
import { movies } from "@/db/schema.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
export const movie = new Hono<AuthContext>();

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

movie.post("/save", async (c) => {
  try {
    const userId = c.get("userId");
    const { imdbId, status } = z.object({
      imdbId: z.string(),
      status: z.enum(movies.status.enumValues).nullable(),
    }).parse(await c.req.json());

    // If status is null, delete the record
    if (status === null) {
      await db.delete(movies).where(
        and(
          eq(movies.imdbId, imdbId),
          eq(movies.userId, userId),
        ),
      );
      return c.json({ message: "Movie removed successfully" });
    }

    // Get movie details from RapidAPI
    const rapidAPIClient = new RapidAPIClient();
    const movieDetails = await rapidAPIClient.imdbSearchByImdbId(imdbId);

    if (!movieDetails) {
      return c.json({ error: "Movie not found" }, 404);
    }

    // Use upsert to create or update the movie
    await db.insert(movies)
      .values({
        userId,
        imdbId,
        title: movieDetails.title.titleText.text,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [movies.userId, movies.imdbId],
        set: {
          status,
          updatedAt: new Date(),
        },
      });

    return c.json({ message: "Movie saved/updated successfully" });
  } catch (error) {
    console.error("Error in /save endpoint:", error);
    return c.json({ error: "Failed to save movie" }, 500);
  }
});

movie.get("/saved", async (c) => {
  try {
    const userId = c.get("userId");
    const rapidAPIClient = new RapidAPIClient();

    const savedMovies = await db.select().from(movies).where(
      eq(movies.userId, userId),
    );

    const imdbMovies = await Promise.all(
      savedMovies.map(async (m) => {
        try {
          const cache = await redis.get(`imdb_movie_${m.imdbId}`).catch(() =>
            null
          );
          if (cache) return cache as RapidAPIIMDBSearchResponseDataEntity;

          const imdbMovie = await rapidAPIClient.imdbSearchByImdbId(
            m.imdbId,
          );

          if (imdbMovie) {
            await redis.set(
              `imdb_movie_${m.imdbId}`,
              JSON.stringify(imdbMovie),
              {
                ex: 60 * 60 * 24,
              },
            ).catch((err) => {
              console.error(`Failed to cache movie ${m.imdbId}:`, err);
            });
          }

          return imdbMovie;
        } catch (error) {
          console.error(`Error processing movie ${m.imdbId}:`, error);
          return null;
        }
      }),
    );

    return c.json({
      movies: imdbMovies.filter((
        m,
      ): m is RapidAPIIMDBSearchResponseDataEntity => m !== null),
    });
  } catch (error) {
    console.error("Error in /saved endpoint:", error);
    return c.json({ error: "Failed to fetch saved movies" }, 500);
  }
});

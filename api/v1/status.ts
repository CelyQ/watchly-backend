import { Hono } from "hono";
import { db } from "@/db/index.ts";
import { movies, tvShows } from "@/db/schema.ts";
import { and, eq } from "drizzle-orm";
import type { AuthContext } from "@/types/context.ts";

export const status = new Hono<AuthContext>();

status.get("/:imdbId", async (c) => {
  try {
    const userId = c.get("userId");
    const imdbId = c.req.param("imdbId");

    // Check both movies and TV shows tables
    const [movieStatus, tvShowStatus] = await Promise.all([
      db.select().from(movies).where(
        and(
          eq(movies.imdbId, imdbId),
          eq(movies.userId, userId),
        ),
      ),
      db.select().from(tvShows).where(
        and(
          eq(tvShows.imdbId, imdbId),
          eq(tvShows.userId, userId),
        ),
      ),
    ]);

    if (movieStatus.length > 0) {
      return c.json({
        type: "movie",
        status: movieStatus[0].status,
      });
    }

    if (tvShowStatus.length > 0) {
      return c.json({
        type: "tv_show",
        status: tvShowStatus[0].status,
      });
    }

    return c.json(null, 200);
  } catch (error) {
    console.error("Error in /status endpoint:", error);
    return c.json({ error: "Failed to fetch status" }, 500);
  }
});

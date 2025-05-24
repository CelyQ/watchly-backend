import { Hono } from "hono";
import { TMDBClient } from "@/lib/tmdb.ts";
import { RapidAPIClient } from "@/lib/rapidapi.ts";
import type { AuthContext } from "@/types/context.ts";
import { db } from "@/db/index.ts";
import { redis } from "@/lib/redis.ts";
import type { RapidAPIIMDBSearchResponseDataEntity } from "@/types/rapidapi.type.ts";
import { tvShows } from "@/db/schema.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const tv = new Hono<AuthContext>();

tv.get("/trending", async (c) => {
  try {
    const tmdbClient = new TMDBClient();
    const rapidAPIClient = new RapidAPIClient();

    const trending = await tmdbClient.getTrendingTV();
    console.log("Got trending TV shows from TMDB:", trending.length);

    const tvshows = (await Promise.all(
      trending.map(async (trend) => {
        try {
          // Try original_name first, then name if original_name fails
          const result = await rapidAPIClient.imdbSearch({
            query: trend.original_name,
            type: "TV",
            cacheKey: trend.id.toString(),
          });

          if (result.length > 0) {
            return result[0];
          }

          // If original_name search failed, try name
          const nameResult = await rapidAPIClient.imdbSearch({
            query: trend.name,
            type: "TV",
            cacheKey: trend.id.toString(),
          });

          if (nameResult.length > 0) {
            return nameResult[0];
          }

          return null;
        } catch (error) {
          console.error(`Error searching IMDB for "${trend.name}":`, error);
          return null;
        }
      }),
    )).filter((show): show is NonNullable<typeof show> => show !== null);

    return c.json({ tvshows }, 200);
  } catch (error) {
    console.error("Error in /trending endpoint:", error);
    if (error instanceof Error && error.message === "Rate limit exceeded.") {
      return c.json({ error: "Rate limit exceeded." }, 429);
    }
    return c.json({ error: "Internal server error." }, 500);
  }
});

tv.post("/save", async (c) => {
  try {
    const userId = c.get("userId");
    const { imdbId, status } = z.object({
      imdbId: z.string(),
      status: z.enum(tvShows.status.enumValues).nullable(),
    }).parse(await c.req.json());

    // If status is null, delete the record
    if (status === null) {
      await db.delete(tvShows).where(
        and(
          eq(tvShows.imdbId, imdbId),
          eq(tvShows.userId, userId),
        ),
      );
      return c.json({ message: "TV show removed successfully" });
    }

    // Get TV show details from RapidAPI
    const rapidAPIClient = new RapidAPIClient();
    const tvShowDetails = await rapidAPIClient.imdbSearchByImdbId(imdbId);

    if (!tvShowDetails) {
      return c.json({ error: "TV show not found" }, 404);
    }

    // Use upsert to create or update the TV show
    await db.insert(tvShows)
      .values({
        userId,
        imdbId,
        title: tvShowDetails.title.titleText.text,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [tvShows.userId, tvShows.imdbId],
        set: {
          status,
          updatedAt: new Date(),
        },
      });

    return c.json({ message: "TV show saved/updated successfully" });
  } catch (error) {
    console.error("Error in /save endpoint:", error);
    return c.json({ error: "Failed to save TV show" }, 500);
  }
});

tv.get("/saved", async (c) => {
  try {
    const userId = c.get("userId");
    const rapidAPIClient = new RapidAPIClient();

    const savedTVShows = await db.select().from(tvShows).where(
      eq(tvShows.userId, userId),
    );

    const imdbTVShows = await Promise.all(
      savedTVShows.map(async (t) => {
        try {
          const cache = await redis.get(`imdb_tv_${t.imdbId}`).catch(() =>
            null
          );
          if (cache) return cache as RapidAPIIMDBSearchResponseDataEntity;

          const imdbTVShow = await rapidAPIClient.imdbSearchByImdbId(
            t.imdbId,
          );

          if (imdbTVShow) {
            await redis.set(
              `imdb_tv_${t.imdbId}`,
              JSON.stringify(imdbTVShow),
              {
                ex: 60 * 60 * 24,
              },
            ).catch((err) => {
              console.error(`Failed to cache TV show ${t.imdbId}:`, err);
            });
          }

          return imdbTVShow;
        } catch (error) {
          console.error(`Error processing TV show ${t.imdbId}:`, error);
          return null;
        }
      }),
    );

    return c.json({
      tvShows: imdbTVShows.filter((
        t,
      ): t is RapidAPIIMDBSearchResponseDataEntity => t !== null),
    });
  } catch (error) {
    console.error("Error in /saved endpoint:", error);
    return c.json({ error: "Failed to fetch saved TV shows" }, 500);
  }
});

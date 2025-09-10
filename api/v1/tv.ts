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

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[:'"()\[\]\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const tvshows = await Promise.all(
      trending.map(async (trend) => {
        try {
          const year = Number.parseInt(
            (trend.first_air_date || "").slice(0, 4),
          );
          const namesToTry = [trend.original_name, trend.name]
            .filter(Boolean)
            .map((n) => n as string);

          const baseNames = Array.from(
            new Set(
              namesToTry.flatMap((n) => {
                const colonIdx = n.indexOf(":");
                const beforeColon = colonIdx !== -1 ? n.slice(0, colonIdx) : n;
                return [n, beforeColon.trim()].filter(Boolean);
              }),
            ),
          );

          // Gather candidates from a couple of queries (with small result sets)
          const queryResults: RapidAPIIMDBSearchResponseDataEntity[][] = [];
          for (let i = 0; i < Math.min(baseNames.length, 2); i++) {
            const q = baseNames[i];
            const res = await rapidAPIClient.imdbSearch({
              query: q,
              type: "TV",
              count: 10,
              cacheKey: `${trend.id}_${i + 1}`,
            });
            queryResults.push(res);
            if (year && res.length === 0) {
              const withYear = await rapidAPIClient.imdbSearch({
                query: `${q} ${year}`,
                type: "TV",
                count: 10,
                cacheKey: `${trend.id}_${i + 1}_y`,
              });
              queryResults.push(withYear);
            }
          }

          const allCandidates = Array.from(
            new Map(
              queryResults
                .flat()
                .map((e) => [e.id, e] as const),
            ).values(),
          );

          const trendNamesNorm = Array.from(new Set(baseNames.map(normalize)));

          const score = (e: RapidAPIIMDBSearchResponseDataEntity) => {
            const title = normalize(e.titleText.text);
            const origTitle = normalize(e.originalTitleText.text);
            const candidateYear = e.releaseYear?.year ?? 0;
            const isSeries = !!e.titleType?.isSeries;

            let s = 0;
            if (isSeries) s += 3;

            // Exact title match preference
            if (trendNamesNorm.some((n) => n === title || n === origTitle)) {
              s += 6;
            }

            // Token inclusion and penalty for missing tokens
            for (const n of trendNamesNorm) {
              const tokens = n.split(" ");
              const missing = tokens.filter((t) =>
                !title.includes(t) && !origTitle.includes(t)
              );
              s += tokens.length - missing.length; // reward matches
              if (missing.length > 0) s -= Math.min(2, missing.length); // slight penalty
            }

            // Year proximity
            if (year) {
              const diff = Math.abs((candidateYear || 0) - year);
              if (diff === 0) s += 4;
              else if (diff === 1) s += 2;
              else if (diff <= 3) s += 1;
              else s -= 1;
            }

            return s;
          };

          if (allCandidates.length > 0) {
            const best = allCandidates
              .sort((a, b) => score(b) - score(a))[0];
            // Normalize primary image aspect ratio to 16:9 to avoid oversized headers/gaps
            const normalized = best.primaryImage
              ? {
                ...best,
                primaryImage: {
                  ...best.primaryImage,
                  width: 1920,
                  height: 1080,
                },
              }
              : best;
            return normalized;
          }

          // As a strict fallback (very rare), try the plain name once more
          const finalTry = await rapidAPIClient.imdbSearch({
            query: trend.name,
            type: "TV",
            count: 10,
            cacheKey: `${trend.id}_final`,
          });
          if (finalTry.length > 0) {
            const f = finalTry[0];
            const normalized = f.primaryImage
              ? {
                ...f,
                primaryImage: {
                  ...f.primaryImage,
                  width: 1920,
                  height: 1080,
                },
              }
              : f;
            return normalized;
          }

          // If absolutely nothing found, return null (should be extremely rare)
          return null;
        } catch (error) {
          console.error(`Error searching IMDB for "${trend.name}":`, error);
          return null;
        }
      }),
    );

    // Preserve original list length; if any nulls slipped through, backfill with first non-null items to keep 20
    const nonNull = tvshows.filter((
      s,
    ): s is RapidAPIIMDBSearchResponseDataEntity => s !== null);
    const result: RapidAPIIMDBSearchResponseDataEntity[] = [];
    for (let i = 0; i < trending.length; i++) {
      result.push(tvshows[i] ?? nonNull[i % Math.max(nonNull.length, 1)]);
    }

    return c.json({ tvshows: result }, 200);
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

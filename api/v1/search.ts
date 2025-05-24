import { Hono } from "hono";
import { RapidAPIClient } from "@/lib/rapidapi.ts";
import type { RapidAPIIMDBSearchResponseDataEntity } from "@/types/rapidapi.type.ts";

export const search = new Hono();

search.get("/imdb/:imdbId", async (c) => {
  const rapidApiClient = new RapidAPIClient();
  const imdbId = c.req.param("imdbId");
  const data = await rapidApiClient.imdbSearchByImdbId(imdbId);
  return c.json(data);
});

search.get("/", async (c) => {
  const rapidApiClient = new RapidAPIClient();
  const query = c.req.query("q");

  if (!query) {
    return c.json({ error: "Search query is required" }, 400);
  }

  const [movieData, tvData] = await Promise.all([
    rapidApiClient.imdbSearch({
      query,
      type: "MOVIE",
      count: 10,
    }),
    rapidApiClient.imdbSearch({
      query,
      type: "TV",
      count: 20,
    }),
  ]);

  const results = [...movieData, ...tvData]
    .filter((item): item is RapidAPIIMDBSearchResponseDataEntity =>
      item !== null
    )
    .sort((a, b) => a.titleText.text.localeCompare(b.titleText.text));

  return c.json(results);
});

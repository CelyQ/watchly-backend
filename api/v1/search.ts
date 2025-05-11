import { Hono } from "hono";
import { RapidAPIClient } from "@/lib/rapidapi.ts";

export const search = new Hono();

search.get("/imdb/:imdbId", async (c) => {
  console.log({ imdbId: c.req.param("imdbId") });
  const rapidApiClient = new RapidAPIClient();
  const imdbId = c.req.param("imdbId");
  const data = await rapidApiClient.imdbSearchByImdbId(imdbId);
  return c.json(data);
});

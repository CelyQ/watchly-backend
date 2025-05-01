import { Redis } from "@upstash/redis";

import "@std/dotenv/load";

export const redis = new Redis({
  url: Deno.env.get("REDIS_URL") || "",
  token: Deno.env.get("REDIS_TOKEN") || "",
});

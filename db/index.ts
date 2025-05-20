import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Configure Neon
neonConfig.fetchConnectionCache = true;

const connectionString = Deno.env.get("DATABASE_URL");
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(connectionString);
export const db = drizzle(sql);

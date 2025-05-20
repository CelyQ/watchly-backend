import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: Deno.env.get("DATABASE_URL") || "",
  },
} satisfies Config;

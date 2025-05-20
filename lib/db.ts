import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "@std/dotenv/load";

// Database connection string
const connectionString = Deno.env.get("DATABASE_URL") || "";

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client);

import { verifyToken } from "@clerk/backend";
import type { Context } from "hono";

import "@std/dotenv/load";

const secretKey = Deno.env.get("CLERK_SECRET_KEY") || "";
const jwtKey = Deno.env.get("CLERK_JWT_KEY") || "";

export async function authMiddleware(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const session = await verifyToken(token, {
      secretKey,
      jwtKey,
    });

    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    // Add the user ID to the context for use in route handlers
    c.set("userId", session.sub);
    await next();
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
}

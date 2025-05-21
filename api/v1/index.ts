import { Hono } from "hono";
import { authMiddleware } from "@/lib/clerk.ts";

import { tv } from "./tv.ts";
import { movie } from "./movie.ts";
import { search } from "./search.ts";
import { status } from "./status.ts";

export const v1 = new Hono();

// Apply auth middleware to all routes
v1.use("/*", authMiddleware);

v1.route("/tv", tv);
v1.route("/movie", movie);
v1.route("/search", search);
v1.route("/status", status);

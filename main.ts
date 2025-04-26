import { Hono } from "hono";
import { v1 } from "./api/v1/index.ts";

import { validateEnv } from "./env.ts";
validateEnv();

const app = new Hono();

app.route("/api/v1", v1);

Deno.serve(app.fetch);

import { Hono } from "hono";
import { v1 } from "./api/v1/index.ts";

import "@std/dotenv/load";

const app = new Hono();

app.route("/api/v1", v1);

Deno.serve(app.fetch);

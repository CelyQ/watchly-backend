import { Hono } from "hono";
import { movie } from "./movie.ts";

export const v1 = new Hono();

v1.route("/movie", movie);

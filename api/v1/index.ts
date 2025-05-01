import { Hono } from "hono";
import { movie } from "./movie.ts";
import { tv } from "./tv.ts";

export const v1 = new Hono();

v1.route("/movie", movie);
v1.route("/tv", tv);

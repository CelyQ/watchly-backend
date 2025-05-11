import { Hono } from "hono";

import { tv } from "./tv.ts";
import { movie } from "./movie.ts";
import { search } from "./search.ts";

export const v1 = new Hono();

v1.route("/tv", tv);
v1.route("/movie", movie);
v1.route("/search", search);

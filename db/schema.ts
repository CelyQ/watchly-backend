import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// Create an enum for movie status
export const movieStatusEnum = pgEnum("movie_status", [
  "WATCHED",
  "PLAN_TO_WATCH",
]);

// Create an enum for TV show status
export const tvShowStatusEnum = pgEnum("tv_show_status", [
  "WATCHED",
  "WATCHING",
  "PLAN_TO_WATCH",
]);

// Movies table with Clerk user reference
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  imdbId: varchar("imdb_id", { length: 20 }).notNull(),
  title: text("title").notNull(),
  status: movieStatusEnum("status").notNull().default("PLAN_TO_WATCH"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userMovieUnique: unique().on(table.userId, table.imdbId),
}));

// TV Shows table with Clerk user reference
export const tvShows = pgTable("tv_shows", {
  id: serial("id").primaryKey(),
  imdbId: varchar("imdb_id", { length: 20 }).notNull(),
  title: text("title").notNull(),
  status: tvShowStatusEnum("status").notNull().default("PLAN_TO_WATCH"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

DO $$ BEGIN
 CREATE TYPE "movie_status" AS ENUM('WATCHED', 'PLAN_TO_WATCH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tv_show_status" AS ENUM('WATCHED', 'WATCHING', 'PLAN_TO_WATCH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"imdb_id" varchar(20) NOT NULL,
	"title" text NOT NULL,
	"status" "movie_status" DEFAULT 'PLAN_TO_WATCH' NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tv_shows" (
	"id" serial PRIMARY KEY NOT NULL,
	"imdb_id" varchar(20) NOT NULL,
	"title" text NOT NULL,
	"status" "tv_show_status" DEFAULT 'PLAN_TO_WATCH' NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

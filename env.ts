import { z } from "zod";

const envSchema = z.object({
  TMDB_API_KEY: z.string(),
});

export const env = envSchema.parse(Deno.env.toObject());
export const validateEnv = () => {
  envSchema.parse(Deno.env.toObject());
};

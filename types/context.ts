import type { Context } from "hono";

export type AuthContext = {
  Variables: {
    userId: string;
  };
};

export type AppContext = Context<AuthContext>;

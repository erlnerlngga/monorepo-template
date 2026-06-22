import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { AuthVariables } from "../auth/middleware";
import { requireAdmin } from "../auth/middleware";
import { usersQuerySchema } from "./schema";
import { listRecentUsers } from "./services";

export const usersRouter = new Hono<{ Variables: AuthVariables }>().get(
  "/",
  zValidator("query", usersQuerySchema),
  async (c) => {
    const currentUser = requireAdmin(c);

    if (!currentUser) {
      return c.json({ error: "forbidden" }, 403);
    }

    const users = await listRecentUsers();

    return c.json({ users }, 200);
  },
);

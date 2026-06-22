import { serve } from "@hono/node-server";
import { apiConfig, loggerConfig } from "@repo/config";
import { createLogger } from "@repo/logger";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./modules/auth/router";
import { usersRouter } from "./modules/users/router";

const logger = createLogger({
  ...loggerConfig,
  service: "api",
});

const app = new Hono()
  .use(
    "*",
    cors({
      origin: (origin) => (apiConfig.clientOrigins.includes(origin) ? origin : null),
      credentials: true,
    }),
  )
  .get("/health", (c) => {
    return c.json({ ok: true, service: "api" });
  })
  .route("/auth", authRouter)
  .route("/users", usersRouter);

serve(
  {
    fetch: app.fetch,
    port: apiConfig.port,
  },
  (info) => {
    logger.info({ port: info.port }, "API listening");
  },
);

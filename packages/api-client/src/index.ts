import { hc } from "hono/client";
import type { AppType } from "@repo/api";

export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;

export class UnauthorizedApiError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedApiError";
  }
}

export async function fetchSessionUser(client: ApiClient) {
  const response = await client.session.$get();

  if (response.status === 401) {
    throw new UnauthorizedApiError();
  }

  if (!response.ok) {
    throw new Error("Failed to load current user.");
  }

  const data = await response.json();

  return data.user;
}

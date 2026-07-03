import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "./app";

const mocks = vi.hoisted(() => ({
  authHandler: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("./modules/auth/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
    handler: mocks.authHandler,
  },
}));

vi.mock("./utils/prisma", () => ({
  prisma: {
    user: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
    },
  },
}));

const baseDate = new Date("2026-07-03T00:00:00.000Z");

describe("api app", () => {
  beforeEach(() => {
    mocks.authHandler.mockReset();
    mocks.findMany.mockReset();
    mocks.findUnique.mockReset();
    mocks.getSession.mockReset();

    mocks.authHandler.mockResolvedValue(new Response(null, { status: 404 }));
    mocks.findMany.mockResolvedValue([]);
    mocks.findUnique.mockResolvedValue(null);
    mocks.getSession.mockResolvedValue(null);
  });

  it("returns health status", async () => {
    const response = await app.request("/health");

    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: "api",
    });
    expect(response.status).toBe(200);
  });

  it("returns unauthorized when a session is missing", async () => {
    const response = await app.request("/session");

    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(response.status).toBe(401);
  });

  it("forbids users access without an admin session", async () => {
    const response = await app.request("/users");

    await expect(response.json()).resolves.toEqual({ error: "forbidden" });
    expect(response.status).toBe(403);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("validates users list limits", async () => {
    mocks.getSession.mockResolvedValue(createAuthSession("admin"));

    const response = await app.request("/users?limit=0");

    expect(response.status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("returns paginated users for admins", async () => {
    mocks.getSession.mockResolvedValue(createAuthSession("admin"));
    mocks.findMany.mockResolvedValue([
      createUser({ id: "user-2", role: null }),
      createUser({ id: "user-1", role: "admin" }),
    ]);

    const response = await app.request("/users?limit=1");

    await expect(response.json()).resolves.toEqual({
      nextCursor: "user-2",
      users: [
        {
          createdAt: baseDate.toISOString(),
          email: "user-2@example.com",
          id: "user-2",
          name: "User user-2",
          role: "user",
          updatedAt: baseDate.toISOString(),
        },
      ],
    });
    expect(response.status).toBe(200);

    const query = mocks.findMany.mock.calls[0]?.[0];
    expect(query.take).toBe(2);
    expect(query.orderBy).toEqual([{ createdAt: "desc" }, { id: "desc" }]);
  });

  it("returns invalid_cursor for missing user cursors", async () => {
    mocks.getSession.mockResolvedValue(createAuthSession("admin"));
    mocks.findUnique.mockResolvedValue(null);

    const response = await app.request("/users?cursor=missing");

    await expect(response.json()).resolves.toEqual({ error: "invalid_cursor" });
    expect(response.status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});

function createAuthSession(role: string) {
  return {
    session: {
      createdAt: baseDate,
      expiresAt: baseDate,
      id: "session-id",
      token: "session-token",
      updatedAt: baseDate,
      userId: "auth-user-id",
    },
    user: {
      createdAt: baseDate,
      email: "admin@example.com",
      emailVerified: true,
      id: "auth-user-id",
      image: null,
      name: "Admin User",
      role,
      updatedAt: baseDate,
    },
  };
}

function createUser({ id, role }: { id: string; role: string | null }) {
  return {
    banned: null,
    banExpires: null,
    banReason: null,
    createdAt: baseDate,
    email: `${id}@example.com`,
    emailVerified: true,
    id,
    image: null,
    name: `User ${id}`,
    role,
    updatedAt: baseDate,
  };
}

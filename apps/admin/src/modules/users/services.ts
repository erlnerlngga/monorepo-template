import { createApiClient } from "@repo/api-client";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const apiClient = createApiClient(apiBaseUrl);

export type AdminUserListItem = {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: string;
  updatedAt: string;
};

export type AdminUsersResponse = {
  nextCursor: string | null;
  users: AdminUserListItem[];
};

export async function listRecentUsers({ limit = 5 }: { limit?: number } = {}) {
  const response = await apiClient.users.$get({
    query: {
      limit: String(limit),
    },
  });

  if (response.status === 403) {
    throw new Error("Admin access required.");
  }

  if (!response.ok) {
    throw new Error("Failed to load users.");
  }

  return (await response.json()) as AdminUsersResponse;
}

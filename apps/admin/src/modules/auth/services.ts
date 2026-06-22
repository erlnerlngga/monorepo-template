import { createApiClient } from "@repo/api-client";
import { createAuthClient } from "better-auth/react";
import type { AuthUser, LoginInput } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const apiClient = createApiClient(apiBaseUrl);
const authClient = createAuthClient({
  baseURL: apiBaseUrl,
});

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function getCurrentUser() {
  const response = await apiClient.session.$get();

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Failed to load current user.");
  }

  const data = await response.json();

  return data.user as AuthUser;
}

export async function login(input: LoginInput) {
  const { error } = await authClient.signIn.email(input);

  if (error) {
    throw new Error(error.message ?? "Authentication failed.");
  }

  return getCurrentUser();
}

export async function logout() {
  const { error } = await authClient.signOut();

  if (error) {
    throw new Error(error.message ?? "Failed to log out.");
  }
}

import { createApiClient, fetchSessionUser, UnauthorizedApiError } from "@repo/api-client";
import { createAuthClient } from "better-auth/react";
import type { AuthUser, LoginInput } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const apiClient = createApiClient(apiBaseUrl);
const authClient = createAuthClient({
  baseURL: apiBaseUrl,
});

export { UnauthorizedApiError as UnauthorizedError };

export async function getCurrentUser() {
  return (await fetchSessionUser(apiClient)) as AuthUser;
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

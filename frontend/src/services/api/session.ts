import { cookies } from "next/headers";
import { getBackendUrl } from "@/services/api/server";
import type { AuthenticatedUser } from "@/types/user";

type SessionResponse = {
  user?: unknown;
};

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    "profileCode" in value &&
    "profileSlug" in value
  );
}

export async function getServerAuthenticatedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (accessToken) {
    const response = await fetch(`${getBackendUrl()}/api/me/`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as SessionResponse;

      return isAuthenticatedUser(data.user) ? data.user : null;
    }

    if (response.status !== 401 || !refreshToken) {
      return null;
    }
  }

  const refreshResponse = await fetch(`${getBackendUrl()}/api/refresh/`, {
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const data = (await refreshResponse.json().catch(() => ({}))) as SessionResponse;

  return isAuthenticatedUser(data.user) ? data.user : null;
}

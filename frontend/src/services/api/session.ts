import { cache } from "react";
import { cookies } from "next/headers";
import type { NotificationPreferences } from "@/features/notifications/data/notification-preferences";
import { getBackendUrl } from "@/services/api/server";
import type { AuthenticatedUser } from "@/types/user";

type SessionResponse = {
  accessToken?: string;
  user?: unknown;
};

type NotificationPreferencesResponse = {
  preferences?: Partial<NotificationPreferences>;
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

export const getServerAuthContext = cache(async () => {
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
      const user = isAuthenticatedUser(data.user) ? data.user : null;

      return user ? { accessToken, user } : null;
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

  if (!isAuthenticatedUser(data.user)) {
    return null;
  }

  return {
    accessToken: data.accessToken ?? null,
    user: data.user,
  };
});

export async function getServerAuthenticatedUser() {
  const context = await getServerAuthContext();

  return context?.user ?? null;
}

export const getServerNotificationPreferences = cache(async () => {
  const context = await getServerAuthContext();

  if (!context?.accessToken) {
    return null;
  }

  const response = await fetch(`${getBackendUrl()}/api/notifications/preferences/`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${context.accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json().catch(() => ({}))) as NotificationPreferencesResponse;

  return {
    dailyCheckInEnabled: Boolean(data.preferences?.dailyCheckInEnabled),
    dailyCheckInTime: data.preferences?.dailyCheckInTime,
    lastPromptDate: data.preferences?.lastPromptDate,
    pushEnabled: Boolean(data.preferences?.pushEnabled),
    timezone: data.preferences?.timezone ?? "America/Sao_Paulo",
  } satisfies NotificationPreferences;
});

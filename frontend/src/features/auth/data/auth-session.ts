import type { HomeProfile } from "@/features/home/types";

export const AUTH_SESSION_STORAGE_KEY = "maia-auth-session";
export const AUTH_SESSION_UPDATED_EVENT = "maia-auth-session-updated";

type AuthSession = {
  active: true;
  profile: HomeProfile;
  startedAt: string;
};

function emitAuthSessionUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_UPDATED_EVENT));
}

export function startMockAuthSession(profile: HomeProfile = "recent-mother") {
  if (typeof window === "undefined") {
    return;
  }

  const session: AuthSession = {
    active: true,
    profile,
    startedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  emitAuthSessionUpdated();
}

export function endMockAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  emitAuthSessionUpdated();
}

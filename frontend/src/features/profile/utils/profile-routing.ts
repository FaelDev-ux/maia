import type { HomeProfile } from "@/features/home/types";
import type { UserProfileCode, UserProfileSlug } from "@/types/user";

const profileByCode: Partial<Record<UserProfileCode, HomeProfile>> = {
  DSM: "future-mother",
  MMT: "experienced-mother",
  PRO: "health-professional",
  PUE: "recent-mother",
};

const profileBySlug: Partial<Record<UserProfileSlug, HomeProfile>> = {
  "experienced-mother": "experienced-mother",
  "future-mother": "future-mother",
  "health-professional": "health-professional",
  "recent-mother": "recent-mother",
};

export function resolveProfile(profile?: string | null): HomeProfile {
  if (profile && profile in profileByCode) {
    return profileByCode[profile as UserProfileCode] ?? "recent-mother";
  }

  if (profile && profile in profileBySlug) {
    return profileBySlug[profile as UserProfileSlug] ?? "recent-mother";
  }

  if (profile === "health-professional") {
    return "health-professional";
  }

  if (profile === "experienced-mother") {
    return "experienced-mother";
  }

  if (profile === "future-mother") {
    return "future-mother";
  }

  return "recent-mother";
}

export function resolveUserProfile(user?: {
  profileCode?: UserProfileCode | string;
  profileSlug?: UserProfileSlug | string;
} | null): HomeProfile {
  return resolveProfile(user?.profileSlug ?? user?.profileCode);
}

export function getProfileScopedHref(path: string, _profile?: HomeProfile | string | null) {
  return path;
}

import type { HomeProfile } from "@/features/home/types";

const routedProfiles = new Set<HomeProfile>([
  "experienced-mother",
  "future-mother",
  "health-professional",
]);

export function resolveProfile(profile?: string | null): HomeProfile {
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

export function getProfileQuery(profile?: HomeProfile | string | null) {
  return routedProfiles.has(profile as HomeProfile) ? `?profile=${profile}` : "";
}

export function getProfileScopedHref(path: string, profile?: HomeProfile | string | null) {
  return `${path}${getProfileQuery(profile)}`;
}

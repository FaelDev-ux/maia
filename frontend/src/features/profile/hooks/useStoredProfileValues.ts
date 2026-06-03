import { useSyncExternalStore } from "react";
import type { HomeProfile } from "@/features/home/types";
import {
  getDefaultProfileValues,
  PROFILE_STORAGE_KEY,
  PROFILE_UPDATED_EVENT,
} from "@/features/profile/data/profile-storage";
import type { ProfileFormValues } from "@/features/profile/types";

function subscribeToProfileChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROFILE_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROFILE_UPDATED_EVENT, onStoreChange);
  };
}

function getProfileSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? "";
}

function getProfileServerSnapshot() {
  return "";
}

export function useStoredProfileValues(profile: HomeProfile) {
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );

  if (!snapshot) {
    return getDefaultProfileValues(profile);
  }

  try {
    return {
      ...getDefaultProfileValues(profile),
      ...(JSON.parse(snapshot) as Partial<ProfileFormValues>),
    };
  } catch {
    return getDefaultProfileValues(profile);
  }
}

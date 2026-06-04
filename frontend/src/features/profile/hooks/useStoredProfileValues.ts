import { useSyncExternalStore } from "react";
import type { HomeProfile } from "@/features/home/types";
import {
  getDefaultProfileValues,
  getDefaultUserProfile,
  getUserProfileFromSnapshot,
  PROFILE_STORAGE_KEY,
  PROFILE_UPDATED_EVENT,
  userProfileToFormValues,
} from "@/features/profile/data/profile-storage";

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

  return userProfileToFormValues(getUserProfileFromSnapshot(snapshot, profile), profile);
}

export function useStoredUserProfile(profile: HomeProfile) {
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );

  if (!snapshot) {
    return getDefaultUserProfile(profile);
  }

  return getUserProfileFromSnapshot(snapshot, profile);
}

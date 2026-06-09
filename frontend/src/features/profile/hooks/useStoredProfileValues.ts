import { useEffect, useSyncExternalStore } from "react";
import type { HomeProfile } from "@/features/home/types";
import {
  getStoredUserProfile,
  PROFILE_UPDATED_EVENT,
  saveAuthenticatedUserProfile,
  userProfileToFormValues,
} from "@/features/profile/data/profile-storage";

function subscribeToProfileChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(PROFILE_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(PROFILE_UPDATED_EVENT, onStoreChange);
  };
}

function getProfileSnapshot() {
  return JSON.stringify(getStoredUserProfile("recent-mother"));
}

function getProfileServerSnapshot() {
  return JSON.stringify(getStoredUserProfile("recent-mother"));
}

function useAuthenticatedProfileSync() {
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as { user?: unknown };

      if (isMounted && response.ok) {
        saveAuthenticatedUserProfile(data.user);
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);
}

export function useStoredProfileValues(profile: HomeProfile) {
  useAuthenticatedProfileSync();
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );

  return userProfileToFormValues(JSON.parse(snapshot), profile);
}

export function useStoredUserProfile(profile: HomeProfile) {
  useAuthenticatedProfileSync();
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );

  return getStoredUserProfile(profile) ?? JSON.parse(snapshot);
}

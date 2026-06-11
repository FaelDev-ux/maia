import { useEffect, useSyncExternalStore } from "react";
import type { HomeProfile } from "@/features/home/types";
import {
  getStoredUserProfileSnapshot,
  getStoredUserProfile,
  getUserProfileFromSnapshot,
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
  return getStoredUserProfileSnapshot();
}

function getProfileServerSnapshot() {
  return "";
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

  return userProfileToFormValues(getUserProfileFromSnapshot(snapshot, profile), profile);
}

export function useStoredUserProfile(profile: HomeProfile) {
  useAuthenticatedProfileSync();
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );

  return snapshot ? getUserProfileFromSnapshot(snapshot, profile) : getStoredUserProfile(profile);
}

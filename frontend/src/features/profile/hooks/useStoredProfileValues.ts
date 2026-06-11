"use client";

import { useSyncExternalStore } from "react";
import { useAuthSession } from "@/features/auth/session-store";
import type { HomeProfile } from "@/features/home/types";
import {
  getStoredUserProfileSnapshot,
  getStoredUserProfile,
  getUserProfileFromSnapshot,
  PROFILE_UPDATED_EVENT,
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

export function useStoredProfileValues(profile: HomeProfile) {
  const authenticatedUser = useAuthSession((state) => state.user);
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );
  const profileSnapshot = authenticatedUser ? JSON.stringify(authenticatedUser) : snapshot;

  return userProfileToFormValues(getUserProfileFromSnapshot(profileSnapshot, profile), profile);
}

export function useStoredUserProfile(profile: HomeProfile) {
  const authenticatedUser = useAuthSession((state) => state.user);
  const snapshot = useSyncExternalStore(
    subscribeToProfileChanges,
    getProfileSnapshot,
    getProfileServerSnapshot
  );
  const profileSnapshot = authenticatedUser ? JSON.stringify(authenticatedUser) : snapshot;

  return profileSnapshot
    ? getUserProfileFromSnapshot(profileSnapshot, profile)
    : getStoredUserProfile(profile);
}

import { useSyncExternalStore } from "react";
import {
  getBrowserNotificationPermission,
  getStoredNotificationPreferences,
  type NotificationPermissionState,
  type NotificationPreferences,
  NOTIFICATION_PREFERENCES_STORAGE_KEY,
  NOTIFICATION_PREFERENCES_UPDATED_EVENT,
} from "@/features/notifications/data/notification-preferences";

type NotificationPreferencesSnapshot = {
  permission: NotificationPermissionState;
  preferences: NotificationPreferences;
};

function subscribeToNotificationPreferences(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, onStoreChange);
  };
}

function getNotificationPreferencesSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify({
      permission: "unsupported",
      preferences: getStoredNotificationPreferences(),
    } satisfies NotificationPreferencesSnapshot);
  }

  return JSON.stringify({
    permission: getBrowserNotificationPermission(),
    preferences: getStoredNotificationPreferences(),
    raw: window.localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY) ?? "",
  });
}

function getNotificationPreferencesServerSnapshot() {
  return JSON.stringify({
    permission: "unsupported",
    preferences: getStoredNotificationPreferences(),
  } satisfies NotificationPreferencesSnapshot);
}

export function useNotificationPreferences() {
  const snapshot = useSyncExternalStore(
    subscribeToNotificationPreferences,
    getNotificationPreferencesSnapshot,
    getNotificationPreferencesServerSnapshot
  );

  try {
    const parsedSnapshot = JSON.parse(snapshot) as NotificationPreferencesSnapshot;

    return {
      permission: parsedSnapshot.permission,
      preferences: parsedSnapshot.preferences,
    };
  } catch {
    return {
      permission: getBrowserNotificationPermission(),
      preferences: getStoredNotificationPreferences(),
    };
  }
}

import { useEffect, useSyncExternalStore } from "react";
import {
  getBrowserNotificationPermission,
  getStoredNotificationPreferences,
  saveNotificationPreferences,
  syncNativeNotificationPermission,
  type NotificationPermissionState,
  type NotificationPreferences,
  NOTIFICATION_PREFERENCES_UPDATED_EVENT,
} from "@/features/notifications/data/notification-preferences";
import { fetchNotificationPreferences } from "@/features/notifications/services";

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
  return JSON.stringify({
    permission: getBrowserNotificationPermission(),
    preferences: getStoredNotificationPreferences(),
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

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      try {
        const preferences = await fetchNotificationPreferences();

        if (isMounted) {
          saveNotificationPreferences(preferences);
        }
      } catch {
        // A permissao do navegador ainda permite renderizar um estado seguro.
      }
    }

    void loadPreferences();
    void syncNativeNotificationPermission();

    return () => {
      isMounted = false;
    };
  }, []);

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

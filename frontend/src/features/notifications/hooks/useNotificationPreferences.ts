"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/features/auth/session-store";
import {
  getBrowserNotificationPermission,
  saveNotificationPreferences,
} from "@/features/notifications/data/notification-preferences";
import { fetchNotificationPreferences } from "@/features/notifications/services";

export function useNotificationPreferences() {
  const permission = useAuthSession((state) => state.notificationPermission);
  const preferences = useAuthSession((state) => state.notificationPreferences);
  const preferencesStatus = useAuthSession((state) => state.notificationPreferencesStatus);
  const setNotificationPermission = useAuthSession((state) => state.setNotificationPermission);
  const setNotificationPreferences = useAuthSession((state) => state.setNotificationPreferences);
  const setNotificationPreferencesStatus = useAuthSession(
    (state) => state.setNotificationPreferencesStatus
  );

  useEffect(() => {
    let isMounted = true;
    const browserPermission = getBrowserNotificationPermission();

    setNotificationPermission(browserPermission);

    if (preferencesStatus !== "idle") {
      return () => {
        isMounted = false;
      };
    }

    setNotificationPreferencesStatus("loading");

    async function loadPreferences() {
      try {
        const preferences = await fetchNotificationPreferences();

        if (isMounted) {
          setNotificationPreferences(preferences);
          saveNotificationPreferences(preferences);
        }
      } catch {
        if (isMounted) {
          setNotificationPreferencesStatus("error");
        }
      }
    }

    void loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [
    preferencesStatus,
    setNotificationPermission,
    setNotificationPreferences,
    setNotificationPreferencesStatus,
  ]);

  return {
    permission,
    preferences,
  };
}

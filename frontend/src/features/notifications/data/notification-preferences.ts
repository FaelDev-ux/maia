export type NotificationPermissionState = NotificationPermission | "unsupported";

export type NotificationPreferences = {
  dailyCheckInEnabled: boolean;
  lastPromptDate?: string;
};

export const NOTIFICATION_PREFERENCES_STORAGE_KEY = "maia-notification-preferences";
export const NOTIFICATION_PREFERENCES_UPDATED_EVENT = "maia-notification-preferences-updated";

const defaultNotificationPreferences: NotificationPreferences = {
  dailyCheckInEnabled: false,
};

function emitNotificationPreferencesUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(NOTIFICATION_PREFERENCES_UPDATED_EVENT));
}

export function getTodayNotificationPromptDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function getStoredNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return defaultNotificationPreferences;
  }

  try {
    const storedPreferences = window.localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);

    if (!storedPreferences) {
      return defaultNotificationPreferences;
    }

    return {
      ...defaultNotificationPreferences,
      ...(JSON.parse(storedPreferences) as Partial<NotificationPreferences>),
    };
  } catch {
    window.localStorage.removeItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
    return defaultNotificationPreferences;
  }
}

export function saveNotificationPreferences(preferences: NotificationPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    NOTIFICATION_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences)
  );
  emitNotificationPreferencesUpdated();
}

export function markNotificationPromptSeenToday() {
  saveNotificationPreferences({
    ...getStoredNotificationPreferences(),
    lastPromptDate: getTodayNotificationPromptDate(),
  });
}

export function shouldShowDailyNotificationPrompt() {
  const permission = getBrowserNotificationPermission();
  const preferences = getStoredNotificationPreferences();

  if (permission === "unsupported" || permission === "denied" || preferences.dailyCheckInEnabled) {
    return false;
  }

  return preferences.lastPromptDate !== getTodayNotificationPromptDate();
}

export async function requestDailyCheckInNotifications() {
  const permission = getBrowserNotificationPermission();
  const nextPreferences = {
    ...getStoredNotificationPreferences(),
    lastPromptDate: getTodayNotificationPromptDate(),
  };

  if (permission === "unsupported") {
    saveNotificationPreferences({
      ...nextPreferences,
      dailyCheckInEnabled: false,
    });
    return "unsupported" satisfies NotificationPermissionState;
  }

  const nextPermission =
    permission === "default" ? await Notification.requestPermission() : permission;

  saveNotificationPreferences({
    ...nextPreferences,
    dailyCheckInEnabled: nextPermission === "granted",
  });

  return nextPermission;
}

export function disableDailyCheckInNotifications() {
  saveNotificationPreferences({
    ...getStoredNotificationPreferences(),
    dailyCheckInEnabled: false,
  });
}

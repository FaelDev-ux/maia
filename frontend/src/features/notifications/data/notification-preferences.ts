export type NotificationPermissionState = NotificationPermission | "unsupported";

export type NotificationPreferences = {
  dailyCheckInTime?: string;
  dailyCheckInEnabled: boolean;
  lastPromptDate?: string;
  pushEnabled?: boolean;
  timezone?: string;
};

export const NOTIFICATION_PREFERENCES_STORAGE_KEY = "maia-notification-preferences";
export const NOTIFICATION_PREFERENCES_UPDATED_EVENT = "maia-notification-preferences-updated";

const defaultNotificationPreferences: NotificationPreferences = {
  dailyCheckInEnabled: false,
  pushEnabled: false,
  timezone: "America/Sao_Paulo",
};

let currentNotificationPreferences = defaultNotificationPreferences;

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
  return currentNotificationPreferences;
}

export function saveNotificationPreferences(preferences: NotificationPreferences) {
  currentNotificationPreferences = {
    ...defaultNotificationPreferences,
    ...preferences,
  };
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
  const { updateNotificationPreferences } = await import("@/features/notifications/services");
  const permission = getBrowserNotificationPermission();
  const nextPreferences = {
    ...getStoredNotificationPreferences(),
    lastPromptDate: getTodayNotificationPromptDate(),
  };

  if (permission === "unsupported") {
    const preferences = {
      ...nextPreferences,
      dailyCheckInEnabled: false,
      pushEnabled: false,
    };

    saveNotificationPreferences(preferences);
    await updateNotificationPreferences(preferences);
    return "unsupported" satisfies NotificationPermissionState;
  }

  const nextPermission =
    permission === "default" ? await Notification.requestPermission() : permission;
  const preferences = {
    ...nextPreferences,
    dailyCheckInEnabled: nextPermission === "granted",
    pushEnabled: nextPermission === "granted",
  };

  saveNotificationPreferences(preferences);
  await updateNotificationPreferences(preferences);

  return nextPermission;
}

export async function disableDailyCheckInNotifications() {
  const { updateNotificationPreferences } = await import("@/features/notifications/services");
  const preferences = {
    ...getStoredNotificationPreferences(),
    dailyCheckInEnabled: false,
    pushEnabled: false,
  };

  saveNotificationPreferences(preferences);
  await updateNotificationPreferences(preferences);
}

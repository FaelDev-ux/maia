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

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

async function registerPushSubscription() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey || typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const { saveNotificationSubscription } = await import("@/features/notifications/services");
  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      userVisibleOnly: true,
    }));

  await saveNotificationSubscription(subscription);
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

  if (nextPermission === "granted") {
    await registerPushSubscription().catch(() => undefined);
  }

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

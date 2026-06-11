import { setAuthSessionNotificationPreferences } from "@/features/auth/session-store";

export type NotificationPermissionState =
  | NotificationPermission
  | "prompt"
  | "prompt-with-rationale"
  | "unsupported";

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

  if (!vapidPublicKey) {
    throw new Error("A chave publica de notificacoes nao esta configurada.");
  }

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("Este dispositivo nao oferece suporte a notificacoes push.");
  }

  const { saveNotificationSubscription } = await import("@/features/notifications/services");
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
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
  setAuthSessionNotificationPreferences(currentNotificationPreferences);
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

  const nextPermission = permission === "default" ? await Notification.requestPermission() : permission;
  const preferences = {
    ...nextPreferences,
    dailyCheckInEnabled: nextPermission === "granted",
    pushEnabled: nextPermission === "granted",
  };

  if (nextPermission === "granted") {
    await registerPushSubscription();
  }

  saveNotificationPreferences(preferences);
  await updateNotificationPreferences(preferences);

  return nextPermission;
}

export async function disableDailyCheckInNotifications() {
  const { deleteNotificationSubscriptions, updateNotificationPreferences } = await import(
    "@/features/notifications/services"
  );
  const preferences = {
    ...getStoredNotificationPreferences(),
    dailyCheckInEnabled: false,
    pushEnabled: false,
  };

  saveNotificationPreferences(preferences);
  await updateNotificationPreferences(preferences);

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }
  }

  await deleteNotificationSubscriptions();
}

export async function updateDailyCheckInReminderTime(dailyCheckInTime: string) {
  const { updateNotificationPreferences } = await import("@/features/notifications/services");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const preferences = {
    ...getStoredNotificationPreferences(),
    dailyCheckInTime,
    timezone,
  };
  const updatedPreferences = await updateNotificationPreferences(preferences);

  saveNotificationPreferences(updatedPreferences);

  return updatedPreferences;
}

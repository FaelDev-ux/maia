import { Capacitor } from "@capacitor/core";

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
let currentNativeNotificationPermission: NotificationPermissionState | null = null;

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
  if (Capacitor.isNativePlatform()) {
    return currentNativeNotificationPermission ?? "default";
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function normalizeNativePermission(permission: string): NotificationPermissionState {
  if (permission === "granted" || permission === "denied") {
    return permission;
  }

  if (permission === "prompt" || permission === "prompt-with-rationale") {
    return permission;
  }

  return "default";
}

export async function syncNativeNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    return getBrowserNotificationPermission();
  }

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const permission = await PushNotifications.checkPermissions();
    currentNativeNotificationPermission = normalizeNativePermission(permission.receive);
  } catch {
    currentNativeNotificationPermission = "unsupported";
  }

  emitNotificationPreferencesUpdated();

  return currentNativeNotificationPermission;
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

async function registerNativePushSubscription() {
  const [{ PushNotifications }, { saveNativeNotificationSubscription }] = await Promise.all([
    import("@capacitor/push-notifications"),
    import("@/features/notifications/services"),
  ]);
  const platform = Capacitor.getPlatform();

  return new Promise<void>((resolve, reject) => {
    let isSettled = false;
    const cleanupHandles: Array<{ remove: () => Promise<void> }> = [];
    const timeoutId = setTimeout(() => {
      settle(() => reject(new Error("Nao foi possivel registrar este dispositivo para notificacoes.")));
    }, 15000);

    function settle(callback: () => void) {
      if (isSettled) {
        return;
      }

      isSettled = true;

      clearTimeout(timeoutId);
      void Promise.all(cleanupHandles.map((handle) => handle.remove().catch(() => undefined)));
      callback();
    }

    PushNotifications.addListener("registration", async (token) => {
      try {
        await saveNativeNotificationSubscription({
          platform,
          token: token.value,
        });
        settle(resolve);
      } catch (error) {
        settle(() => reject(error));
      }
    })
      .then((handle) => cleanupHandles.push(handle))
      .catch((error) => settle(() => reject(error)));

    PushNotifications.addListener("registrationError", (error) => {
      const message =
        typeof error.error === "string"
          ? error.error
          : "Nao foi possivel ativar notificacoes neste dispositivo.";
      settle(() => reject(new Error(message)));
    })
      .then((handle) => cleanupHandles.push(handle))
      .catch((error) => settle(() => reject(error)));

    void PushNotifications.register();
  });
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
  const permission = Capacitor.isNativePlatform()
    ? await syncNativeNotificationPermission()
    : getBrowserNotificationPermission();
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

  let nextPermission: NotificationPermissionState = permission;

  if (Capacitor.isNativePlatform()) {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const nativePermission =
      permission === "granted" ? await PushNotifications.checkPermissions() : await PushNotifications.requestPermissions();
    nextPermission = normalizeNativePermission(nativePermission.receive);
    currentNativeNotificationPermission = nextPermission;
  } else {
    nextPermission = permission === "default" ? await Notification.requestPermission() : permission;
  }

  const preferences = {
    ...nextPreferences,
    dailyCheckInEnabled: nextPermission === "granted",
    pushEnabled: nextPermission === "granted",
  };

  if (nextPermission === "granted") {
    if (Capacitor.isNativePlatform()) {
      await registerNativePushSubscription();
    } else {
      await registerPushSubscription();
    }
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

  if (!Capacitor.isNativePlatform() && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
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

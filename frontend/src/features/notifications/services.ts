import { apiFetch } from "@/services/api/client";
import type { NotificationPreferences } from "@/features/notifications/data/notification-preferences";

type PreferencesResponse = {
  preferences?: Partial<NotificationPreferences>;
};

export async function fetchNotificationPreferences() {
  const data = await apiFetch<PreferencesResponse>(
    "/api/notifications/preferences",
    undefined,
    "Nao foi possivel carregar preferencias de notificacao."
  );

  return {
    dailyCheckInEnabled: Boolean(data.preferences?.dailyCheckInEnabled),
    dailyCheckInTime: data.preferences?.dailyCheckInTime,
    lastPromptDate: data.preferences?.lastPromptDate,
    pushEnabled: Boolean(data.preferences?.pushEnabled),
    timezone: data.preferences?.timezone ?? "America/Sao_Paulo",
  } satisfies NotificationPreferences;
}

export async function updateNotificationPreferences(preferences: NotificationPreferences) {
  const data = await apiFetch<PreferencesResponse>(
    "/api/notifications/preferences",
    {
      body: JSON.stringify(preferences),
      method: "PUT",
    },
    "Nao foi possivel atualizar preferencias de notificacao."
  );

  return {
    ...preferences,
    ...data.preferences,
  } satisfies NotificationPreferences;
}

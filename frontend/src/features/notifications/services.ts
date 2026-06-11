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

export async function saveNotificationSubscription(subscription: PushSubscription) {
  return apiFetch(
    "/api/notifications/subscriptions",
    {
      body: JSON.stringify(subscription.toJSON()),
      method: "POST",
    },
    "Nao foi possivel salvar sua inscricao de notificacao."
  );
}

export async function saveNativeNotificationSubscription(subscription: {
  platform: string;
  token: string;
}) {
  return apiFetch(
    "/api/notifications/subscriptions",
    {
      body: JSON.stringify({
        platform: subscription.platform,
        provider: "fcm",
        token: subscription.token,
      }),
      method: "POST",
    },
    "Nao foi possivel salvar sua inscricao de notificacao."
  );
}

export async function deleteNotificationSubscriptions() {
  return apiFetch(
    "/api/notifications/subscriptions",
    {
      method: "DELETE",
    },
    "Nao foi possivel remover sua inscricao de notificacao."
  );
}

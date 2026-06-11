import { AlertCircle, BellRing, Clock3, Save } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  disableDailyCheckInNotifications,
  requestDailyCheckInNotifications,
  updateDailyCheckInReminderTime,
} from "@/features/notifications/data/notification-preferences";
import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences";
import cn from "@/lib/utils";

function getPermissionStatusLabel(permission: ReturnType<typeof useNotificationPreferences>["permission"]) {
  if (permission === "granted") {
    return "Permitido pelo navegador";
  }

  if (permission === "denied") {
    return "Bloqueado pelo dispositivo";
  }

  if (permission === "unsupported") {
    return "Indisponível neste dispositivo";
  }

  if (permission === "prompt" || permission === "prompt-with-rationale") {
    return "Aguardando permissão";
  }

  return "Ainda não permitido";
}

export function NotificationSettingsCard() {
  const { permission, preferences } = useNotificationPreferences();
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [reminderTimeDraft, setReminderTimeDraft] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isEnabled = preferences.dailyCheckInEnabled && permission === "granted";
  const isUnavailable = permission === "unsupported" || permission === "denied";
  const reminderTime = reminderTimeDraft ?? preferences.dailyCheckInTime ?? "20:00";

  async function handleToggle() {
    setIsUpdating(true);
    setError("");

    try {
      if (isEnabled) {
        await disableDailyCheckInNotifications();
        return;
      }

      await requestDailyCheckInNotifications();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Nao foi possivel atualizar as notificacoes."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSaveTime() {
    setIsUpdating(true);
    setError("");

    try {
      await updateDailyCheckInReminderTime(reminderTime);
      setReminderTimeDraft(null);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Nao foi possivel salvar o horario do lembrete."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <section className="mt-6 rounded-[2rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/55 md:px-8">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <BellRing aria-hidden size={23} strokeWidth={2.3} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-title text-xl font-extrabold leading-tight text-title">
                Notificações
              </h2>
              <p className="mt-2 text-sm leading-6 text-text">
                Receba lembretes para registrar seu check-in diário todos os dias.
              </p>
            </div>

            <motion.button
              aria-checked={isEnabled}
              aria-label="Permitir notificações de check-in diário"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      backgroundColor: isEnabled ? "#f48ba4" : "#e7e1e2",
                    }
              }
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isEnabled ? "bg-primary" : "bg-neutral",
                (isUnavailable || isUpdating) && "cursor-not-allowed opacity-70"
              )}
              disabled={isUnavailable || isUpdating}
              onClick={handleToggle}
              role="switch"
              transition={{ duration: 0.22, ease: "easeOut" }}
              type="button"
              whileTap={shouldReduceMotion || isUnavailable || isUpdating ? undefined : { scale: 0.96 }}
            >
              <motion.span
                animate={shouldReduceMotion ? undefined : { x: isEnabled ? 24 : 0 }}
                className={cn(
                  "absolute left-1 top-1 grid size-6 place-items-center rounded-full bg-white shadow-sm",
                  shouldReduceMotion && (isEnabled ? "translate-x-6" : "translate-x-0")
                )}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
              {isEnabled ? "Lembrete ativo" : "Lembrete inativo"}
            </span>
            <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold text-text">
              {getPermissionStatusLabel(permission)}
            </span>
            {isUpdating ? (
              <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold text-text">
                Atualizando...
              </span>
            ) : null}
          </div>

          {permission === "denied" ? (
            <p className="mt-4 text-sm leading-6 text-text">
              Para ativar novamente, libere as notificações nas configurações do dispositivo.
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-extrabold text-title">
                <Clock3 aria-hidden size={17} />
                Horario do lembrete
              </span>
              <input
                className="mt-2 h-12 w-full rounded-[0.85rem] bg-background px-4 text-sm font-bold text-title outline-none ring-1 ring-border/80 focus:ring-2 focus:ring-primary"
                disabled={isUpdating}
                onChange={(event) => setReminderTimeDraft(event.target.value)}
                type="time"
                value={reminderTime}
              />
            </label>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white disabled:opacity-60"
              disabled={isUpdating}
              onClick={() => void handleSaveTime()}
              type="button"
            >
              <Save aria-hidden size={17} />
              Salvar
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-text/75">
            O lembrete usa o fuso horario deste dispositivo e nao e enviado se o check-in do dia ja
            tiver sido registrado.
          </p>

          {error ? (
            <p className="mt-4 flex items-start gap-2 rounded-[1rem] bg-danger/[0.1] px-4 py-3 text-sm font-bold leading-5 text-red-800">
              <AlertCircle aria-hidden className="mt-0.5 shrink-0" size={17} />
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

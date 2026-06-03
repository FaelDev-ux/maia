import { BellRing } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  disableDailyCheckInNotifications,
  requestDailyCheckInNotifications,
} from "@/features/notifications/data/notification-preferences";
import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences";
import cn from "@/lib/utils";

function getPermissionStatusLabel(permission: ReturnType<typeof useNotificationPreferences>["permission"]) {
  if (permission === "granted") {
    return "Permitido pelo navegador";
  }

  if (permission === "denied") {
    return "Bloqueado pelo navegador";
  }

  if (permission === "unsupported") {
    return "Indisponível neste dispositivo";
  }

  return "Ainda não permitido";
}

export function NotificationSettingsCard() {
  const { permission, preferences } = useNotificationPreferences();
  const [isUpdating, setIsUpdating] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isEnabled = preferences.dailyCheckInEnabled && permission === "granted";
  const isUnavailable = permission === "unsupported" || permission === "denied";

  async function handleToggle() {
    setIsUpdating(true);

    if (isEnabled) {
      disableDailyCheckInNotifications();
      setIsUpdating(false);
      return;
    }

    await requestDailyCheckInNotifications();
    setIsUpdating(false);
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
              Para ativar novamente, libere as notificações nas configurações do navegador.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

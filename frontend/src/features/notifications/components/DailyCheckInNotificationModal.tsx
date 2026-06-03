import { BellRing, X } from "lucide-react";

type DailyCheckInNotificationModalProps = {
  onAllow: () => void;
  onDismiss: () => void;
};

export function DailyCheckInNotificationModal({
  onAllow,
  onDismiss,
}: DailyCheckInNotificationModalProps) {
  return (
    <div
      aria-labelledby="notification-permission-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-title/35 px-5 pb-5 backdrop-blur-sm md:items-center md:justify-center md:p-8"
      role="dialog"
    >
      <section className="w-full max-w-[25rem] rounded-[2.25rem] bg-white px-6 py-7 shadow-[0_24px_70px_rgb(57_55_56_/_0.22)] ring-1 ring-border/70">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <BellRing aria-hidden size={27} strokeWidth={2.3} />
          </span>
          <button
            aria-label="Agora não"
            className="grid size-10 place-items-center rounded-full text-text transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onDismiss}
            type="button"
          >
            <X aria-hidden size={20} strokeWidth={2.4} />
          </button>
        </div>

        <h2
          className="mt-6 font-title text-2xl font-extrabold leading-tight text-title"
          id="notification-permission-title"
        >
          Quer receber lembretes do check-in diário?
        </h2>
        <p className="mt-4 text-base leading-7 text-text">
          As notificações serão usadas para lembrar você de registrar seu check-in emocional todos
          os dias, com cuidado e sem excesso.
        </p>

        <div className="mt-7 grid gap-3">
          <button
            className="flex h-14 items-center justify-center rounded-full bg-primary px-6 font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            onClick={onAllow}
            type="button"
          >
            Permitir notificações
          </button>
          <button
            className="flex h-12 items-center justify-center rounded-full bg-surface px-6 font-extrabold text-title transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onDismiss}
            type="button"
          >
            Agora não
          </button>
        </div>
      </section>
    </div>
  );
}

"use client";

import { BellRing, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type PushMessage = {
  body: string;
  title: string;
  url: string;
};

type ServiceWorkerPushEvent = MessageEvent<{
  payload?: Partial<PushMessage>;
  type?: string;
}>;

export function InAppPushNotification() {
  const [message, setMessage] = useState<PushMessage | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    function handleMessage(event: ServiceWorkerPushEvent) {
      if (event.data?.type !== "MAIA_PUSH_RECEIVED") {
        return;
      }

      setMessage({
        body: event.data.payload?.body ?? "Hora de fazer um check-in gentil.",
        title: event.data.payload?.title ?? "Maia",
        url: event.data.payload?.url ?? "/check-in",
      });
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-4 top-4 z-[90] mx-auto flex max-w-[30rem] items-start gap-3 rounded-[1.35rem] bg-white p-4 text-text shadow-[0_22px_60px_rgb(57_55_56_/_0.22)] ring-1 ring-border/80"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <BellRing aria-hidden size={20} strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-title text-sm font-extrabold text-title">{message.title}</p>
        <p className="mt-1 text-sm leading-5">{message.body}</p>
        <Link
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-xs font-extrabold text-white"
          href={message.url}
          onClick={() => setMessage(null)}
        >
          Fazer check-in
        </Link>
      </div>
      <button
        aria-label="Fechar lembrete"
        className="grid size-9 shrink-0 place-items-center rounded-full text-text hover:bg-primary/10 hover:text-primary"
        onClick={() => setMessage(null)}
        type="button"
      >
        <X aria-hidden size={17} />
      </button>
    </aside>
  );
}

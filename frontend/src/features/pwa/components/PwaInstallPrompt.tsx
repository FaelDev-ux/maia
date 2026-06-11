"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Home, Share, Smartphone, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  markPwaInstalled,
  markPwaInstallDismissedRecently,
  shouldShowPwaInstallPrompt,
} from "@/features/pwa/data/install-preferences";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const installBenefits = [
  "Acesso mais rápido direto pela tela inicial.",
  "Experiência parecida com um app nativo.",
  "Interface mais confortável para usar no celular.",
  "Menos dependência de abrir tudo pelo navegador.",
];

const iosInstallSteps = [
  "Toque no botão de compartilhar do Safari.",
  "Escolha Adicionar à Tela de Início.",
  "Confirme o nome Maia e toque em Adicionar.",
];

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches
  );
}

function isIosInstallCapable() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
  const isIpadLikeMac = window.navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isSafari = /safari/.test(userAgent) && !/crios|edgios|fxios/.test(userAgent);

  return (isIosDevice || isIpadLikeMac) && isSafari;
}

function subscribeToMountedState() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getMountedServerSnapshot() {
  return false;
}

async function clearDevelopmentServiceWorkers() {
  if (process.env.NODE_ENV === "production" || !("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const cacheNames = await caches.keys();

    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
}

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const hasMounted = useSyncExternalStore(
    subscribeToMountedState,
    getMountedSnapshot,
    getMountedServerSnapshot
  );
  const [isHiddenForSession, setIsHiddenForSession] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const isHomeRoute = pathname === "/home";
  const canUseNativePrompt = Boolean(installPromptEvent);
  const canShowIosInstructions = hasMounted && !canUseNativePrompt && isIosInstallCapable();
  const isOpen =
    hasMounted &&
    isHomeRoute &&
    (canUseNativePrompt || canShowIosInstructions) &&
    !isHiddenForSession &&
    shouldShowPwaInstallPrompt() &&
    !isStandaloneDisplay();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      void clearDevelopmentServiceWorkers();
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // A instalação continua opcional; falhas de registro não devem bloquear o app.
    });
  }, []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      markPwaInstalled();
      setInstallPromptEvent(null);
      setIsHiddenForSession(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (isStandaloneDisplay()) {
      markPwaInstalled();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPromptEvent && canShowIosInstructions) {
      setShowIosInstructions(true);
      return;
    }

    if (!installPromptEvent) {
      return;
    }

    setIsHiddenForSession(true);
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;

    if (choice.outcome === "accepted") {
      markPwaInstalled();
    } else {
      markPwaInstallDismissedRecently();
    }

    setInstallPromptEvent(null);
  }

  function handleContinueInBrowser() {
    markPwaInstallDismissedRecently();
    setShowIosInstructions(false);
    setIsHiddenForSession(true);
  }

  function handleClose() {
    markPwaInstallDismissedRecently();
    setShowIosInstructions(false);
    setIsHiddenForSession(true);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="pwa-install-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-title/35 px-4 pb-4 pt-12 backdrop-blur-sm md:items-center md:p-8"
      role="dialog"
    >
      <section className="relative w-full max-w-[27rem] rounded-[2rem] bg-background px-6 pb-6 pt-7 text-text shadow-[0_28px_80px_rgb(57_55_56_/_0.24)] ring-1 ring-white/80 md:px-7">
        <button
          aria-label="Fechar convite de instalação"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white text-text ring-1 ring-border transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={handleClose}
          type="button"
        >
          <X aria-hidden size={17} strokeWidth={2.4} />
        </button>

        <div className="grid size-15 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          <Smartphone aria-hidden size={26} strokeWidth={2.4} />
        </div>

        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
          <Sparkles aria-hidden size={13} strokeWidth={2.4} />
          Maia no celular
        </p>

        <h2
          className="mt-4 font-title text-2xl font-extrabold leading-tight text-title"
          id="pwa-install-title"
        >
          Instale o Maia e cuide da sua jornada com mais facilidade
        </h2>

        <p className="mt-3 text-sm leading-6 text-text">
          {showIosInstructions
            ? "No iPhone, a instalação é feita pelo menu de compartilhamento do Safari."
            : "Você pode adicionar o Maia à tela inicial do celular e abrir tudo com um toque, como um aplicativo."}
        </p>

        {showIosInstructions ? (
          <ol className="mt-5 grid gap-3">
            {iosInstallSteps.map((step, index) => (
              <li
                className="flex items-start gap-3 rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold leading-6 text-title ring-1 ring-border/70"
                key={step}
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="mt-5 grid gap-3">
            {installBenefits.map((benefit) => (
              <li
                className="flex items-start gap-3 rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold leading-6 text-title ring-1 ring-border/70"
                key={benefit}
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Home aria-hidden size={13} strokeWidth={2.5} />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 grid gap-3">
          <button
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={handleInstall}
            type="button"
          >
            {showIosInstructions ? (
              <Share aria-hidden size={17} strokeWidth={2.4} />
            ) : (
              <Download aria-hidden size={17} strokeWidth={2.4} />
            )}
            {showIosInstructions ? "Entendi como instalar" : "Instalar aplicativo"}
          </button>

          <button
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={handleContinueInBrowser}
            type="button"
          >
            Continuar pelo navegador
          </button>
        </div>
      </section>
    </div>
  );
}

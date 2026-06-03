export const PWA_SIGNUP_INSTALL_PENDING_KEY = "maia-pwa-signup-install-pending";
export const PWA_INSTALL_DISMISSED_UNTIL_KEY = "maia-pwa-install-dismissed-until";
export const PWA_INSTALLED_KEY = "maia-pwa-installed";

const dismissDelayInMs = 14 * 24 * 60 * 60 * 1000;

export function markPwaInstallPromptPending() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PWA_SIGNUP_INSTALL_PENDING_KEY, "true");
}

export function clearPwaInstallPromptPending() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PWA_SIGNUP_INSTALL_PENDING_KEY);
}

export function markPwaInstallDismissedRecently() {
  if (typeof window === "undefined") {
    return;
  }

  const dismissedUntil = Date.now() + dismissDelayInMs;
  window.localStorage.setItem(PWA_INSTALL_DISMISSED_UNTIL_KEY, String(dismissedUntil));
}

export function markPwaInstalled() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PWA_INSTALLED_KEY, "true");
  window.localStorage.removeItem(PWA_INSTALL_DISMISSED_UNTIL_KEY);
  clearPwaInstallPromptPending();
}

export function shouldShowPwaInstallPrompt() {
  if (typeof window === "undefined") {
    return false;
  }

  const isPendingAfterSignup = window.localStorage.getItem(PWA_SIGNUP_INSTALL_PENDING_KEY) === "true";
  const isInstalled = window.localStorage.getItem(PWA_INSTALLED_KEY) === "true";
  const dismissedUntil = Number(window.localStorage.getItem(PWA_INSTALL_DISMISSED_UNTIL_KEY) ?? 0);

  return isPendingAfterSignup && !isInstalled && Date.now() > dismissedUntil;
}

"use client";

import { Capacitor } from "@capacitor/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const ROOT_ROUTES = new Set(["/", "/auth", "/home"]);

export function NativeBackButtonHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isActive = true;
    let cleanup: (() => void) | undefined;

    async function registerBackButtonHandler() {
      const { App } = await import("@capacitor/app");

      if (!isActive) {
        return;
      }

      const listener = await App.addListener("backButton", ({ canGoBack }) => {
        const currentPath = pathnameRef.current;
        const shouldExitApp = ROOT_ROUTES.has(currentPath) || (!canGoBack && currentPath === "/home");

        if (shouldExitApp) {
          void App.exitApp();
          return;
        }

        if (canGoBack || currentPath !== "/") {
          router.back();
          return;
        }

        void App.exitApp();
      });

      cleanup = () => {
        void listener.remove();
      };
    }

    void registerBackButtonHandler();

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, [router]);

  return null;
}

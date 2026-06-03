"use client";

import { useSyncExternalStore } from "react";
import {
  DAILY_CHECK_INS_STORAGE_KEY,
  DAILY_CHECK_INS_UPDATED_EVENT,
} from "@/features/check-in/data/check-in-storage";
import type { DailyCheckInRecord } from "@/features/check-in/types";

function subscribeToDailyCheckIns(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DAILY_CHECK_INS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DAILY_CHECK_INS_UPDATED_EVENT, onStoreChange);
  };
}

function getDailyCheckInsSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(DAILY_CHECK_INS_STORAGE_KEY) ?? "";
}

function getDailyCheckInsServerSnapshot() {
  return "";
}

export function useStoredDailyCheckIns() {
  const snapshot = useSyncExternalStore(
    subscribeToDailyCheckIns,
    getDailyCheckInsSnapshot,
    getDailyCheckInsServerSnapshot
  );

  if (!snapshot) {
    return [];
  }

  try {
    const records = JSON.parse(snapshot) as unknown;

    return Array.isArray(records) ? (records as DailyCheckInRecord[]) : [];
  } catch {
    return [];
  }
}

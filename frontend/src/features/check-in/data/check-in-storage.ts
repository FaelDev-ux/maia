import type { DailyCheckInRecord } from "@/features/check-in/types";

export const DAILY_CHECK_INS_STORAGE_KEY = "maia-daily-check-ins";

export function getStoredDailyCheckIns() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedRecords = window.localStorage.getItem(DAILY_CHECK_INS_STORAGE_KEY);

    return storedRecords ? (JSON.parse(storedRecords) as DailyCheckInRecord[]) : [];
  } catch {
    window.localStorage.removeItem(DAILY_CHECK_INS_STORAGE_KEY);
    return [];
  }
}

export function saveDailyCheckIn(record: DailyCheckInRecord) {
  const records = getStoredDailyCheckIns();

  window.localStorage.setItem(DAILY_CHECK_INS_STORAGE_KEY, JSON.stringify([record, ...records]));
}

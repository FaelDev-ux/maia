import type { DailyCheckInRecord } from "@/features/check-in/types";

export const DAILY_CHECK_INS_STORAGE_KEY = "maia-daily-check-ins";
export const DAILY_CHECK_INS_UPDATED_EVENT = "maia-daily-check-ins-updated";

function emitDailyCheckInsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DAILY_CHECK_INS_UPDATED_EVENT));
}

export function getDailyCheckInDateKey(createdAt: string) {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayDateKey() {
  return getDailyCheckInDateKey(new Date().toISOString());
}

export function getStoredDailyCheckIns() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedRecords = window.localStorage.getItem(DAILY_CHECK_INS_STORAGE_KEY);
    const parsedRecords = storedRecords ? (JSON.parse(storedRecords) as unknown) : [];

    return Array.isArray(parsedRecords) ? (parsedRecords as DailyCheckInRecord[]) : [];
  } catch {
    window.localStorage.removeItem(DAILY_CHECK_INS_STORAGE_KEY);
    return [];
  }
}

export function getDailyCheckInByDate(dateKey: string) {
  return getStoredDailyCheckIns().find(
    (record) => getDailyCheckInDateKey(record.createdAt) === dateKey
  );
}

export function getTodayDailyCheckIn() {
  return getDailyCheckInByDate(getTodayDateKey());
}

export function saveDailyCheckIn(record: DailyCheckInRecord) {
  const records = getStoredDailyCheckIns();

  window.localStorage.setItem(DAILY_CHECK_INS_STORAGE_KEY, JSON.stringify([record, ...records]));
  emitDailyCheckInsUpdated();
}

export function updateDailyCheckIn(record: DailyCheckInRecord) {
  const records = getStoredDailyCheckIns();
  const updatedRecords = records.map((currentRecord) =>
    currentRecord.id === record.id ? record : currentRecord
  );

  window.localStorage.setItem(DAILY_CHECK_INS_STORAGE_KEY, JSON.stringify(updatedRecords));
  emitDailyCheckInsUpdated();
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDailyCheckIns } from "@/features/check-in/services";
import type { DailyCheckInRecord } from "@/features/check-in/types";

export function useStoredDailyCheckIns() {
  const [records, setRecords] = useState<DailyCheckInRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setRecords(await fetchDailyCheckIns());
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Nao foi possivel carregar seus check-ins."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  return { error, isLoading, records, reload };
}

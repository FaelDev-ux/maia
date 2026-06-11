"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdminActions, fetchProfessionalVerifications } from "@/features/admin/services";
import type {
  ProfessionalVerification,
  ProfessionalVerificationAction,
} from "@/features/admin/types";

export function useProfessionalVerifications() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [verifications, setVerifications] = useState<ProfessionalVerification[]>([]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setVerifications(await fetchProfessionalVerifications());
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Nao foi possivel carregar validacoes profissionais."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  return { error, isLoading, reload, verifications };
}

export function useProfessionalVerificationActions(): ProfessionalVerificationAction[] {
  const [actions, setActions] = useState<ProfessionalVerificationAction[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadActions() {
      try {
        const nextActions = await fetchAdminActions();

        if (isMounted) {
          setActions(nextActions);
        }
      } catch {
        if (isMounted) {
          setActions([]);
        }
      }
    }

    void loadActions();

    return () => {
      isMounted = false;
    };
  }, []);

  return actions;
}

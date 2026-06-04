"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getProfessionalVerificationActionsServerSnapshot,
  getProfessionalVerificationActionsSnapshot,
  getProfessionalVerificationsServerSnapshot,
  getProfessionalVerificationsSnapshot,
  PROFESSIONAL_VERIFICATIONS_UPDATED_EVENT,
} from "@/features/admin/data/professional-verifications";
import type {
  ProfessionalVerification,
  ProfessionalVerificationAction,
} from "@/features/admin/types";

function subscribeToProfessionalVerifications(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROFESSIONAL_VERIFICATIONS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROFESSIONAL_VERIFICATIONS_UPDATED_EVENT, onStoreChange);
  };
}

function parseVerifications(snapshot: string) {
  try {
    const parsedVerifications = JSON.parse(snapshot) as unknown;

    return Array.isArray(parsedVerifications)
      ? (parsedVerifications as ProfessionalVerification[])
      : [];
  } catch {
    return [];
  }
}

function parseActions(snapshot: string) {
  try {
    const parsedActions = JSON.parse(snapshot) as unknown;

    return Array.isArray(parsedActions)
      ? (parsedActions as ProfessionalVerificationAction[])
      : [];
  } catch {
    return [];
  }
}

export function useProfessionalVerifications() {
  const verificationsSnapshot = useSyncExternalStore(
    subscribeToProfessionalVerifications,
    getProfessionalVerificationsSnapshot,
    getProfessionalVerificationsServerSnapshot
  );

  return useMemo(() => parseVerifications(verificationsSnapshot), [verificationsSnapshot]);
}

export function useProfessionalVerificationActions() {
  const actionsSnapshot = useSyncExternalStore(
    subscribeToProfessionalVerifications,
    getProfessionalVerificationActionsSnapshot,
    getProfessionalVerificationActionsServerSnapshot
  );

  return useMemo<ProfessionalVerificationAction[]>(
    () => parseActions(actionsSnapshot),
    [actionsSnapshot]
  );
}

"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RegisterFormData } from "@/schemas/auth.schema";

type RegistrationDraftContextValue = {
  clearRegistrationDraft: () => void;
  registrationDraft: RegisterFormData | null;
  setRegistrationDraft: (draft: RegisterFormData) => void;
};

const RegistrationDraftContext = createContext<RegistrationDraftContextValue | null>(null);

type RegistrationDraftProviderProps = {
  children: ReactNode;
};

export function RegistrationDraftProvider({ children }: RegistrationDraftProviderProps) {
  const [registrationDraft, setRegistrationDraftState] = useState<RegisterFormData | null>(null);
  const value = useMemo<RegistrationDraftContextValue>(
    () => ({
      clearRegistrationDraft: () => setRegistrationDraftState(null),
      registrationDraft,
      setRegistrationDraft: setRegistrationDraftState,
    }),
    [registrationDraft]
  );

  return (
    <RegistrationDraftContext.Provider value={value}>
      {children}
    </RegistrationDraftContext.Provider>
  );
}

export function useRegistrationDraft() {
  const context = useContext(RegistrationDraftContext);

  if (!context) {
    throw new Error("useRegistrationDraft deve ser usado dentro de RegistrationDraftProvider.");
  }

  return context;
}

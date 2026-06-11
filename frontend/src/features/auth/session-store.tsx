"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import type {
  NotificationPermissionState,
  NotificationPreferences,
} from "@/features/notifications/data/notification-preferences";
import type { AuthenticatedUser } from "@/types/user";

type NotificationPreferencesStatus = "idle" | "loading" | "loaded" | "error";

type AuthSessionState = {
  notificationPermission: NotificationPermissionState;
  notificationPreferences: NotificationPreferences;
  notificationPreferencesStatus: NotificationPreferencesStatus;
  setNotificationPermission: (permission: NotificationPermissionState) => void;
  setNotificationPreferences: (
    preferences: NotificationPreferences,
    status?: NotificationPreferencesStatus
  ) => void;
  setNotificationPreferencesStatus: (status: NotificationPreferencesStatus) => void;
  setUser: (user: unknown) => void;
  user: AuthenticatedUser | null;
};

type CreateAuthSessionStoreInput = {
  initialNotificationPreferences?: NotificationPreferences | null;
  initialUser?: AuthenticatedUser | null;
};

export type AuthSessionStore = StoreApi<AuthSessionState>;

const defaultNotificationPreferences: NotificationPreferences = {
  dailyCheckInEnabled: false,
  pushEnabled: false,
  timezone: "America/Sao_Paulo",
};

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    "profileCode" in value &&
    "profileSlug" in value
  );
}

export function getNotificationPreferencesFromUser(
  user?: AuthenticatedUser | null
): NotificationPreferences {
  return {
    ...defaultNotificationPreferences,
    dailyCheckInEnabled: Boolean(user?.notificationSummary?.dailyCheckInEnabled),
    pushEnabled: Boolean(user?.notificationSummary?.pushEnabled),
    timezone: user?.notificationSummary?.timezone ?? defaultNotificationPreferences.timezone,
  };
}

export function createAuthSessionStore({
  initialNotificationPreferences,
  initialUser = null,
}: CreateAuthSessionStoreInput = {}) {
  const notificationPreferences =
    initialNotificationPreferences ?? getNotificationPreferencesFromUser(initialUser);

  return createStore<AuthSessionState>()((set) => ({
    notificationPermission: "unsupported",
    notificationPreferences,
    notificationPreferencesStatus: initialNotificationPreferences ? "loaded" : "idle",
    setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    setNotificationPreferences: (preferences, status = "loaded") =>
      set({
        notificationPreferences: {
          ...defaultNotificationPreferences,
          ...preferences,
        },
        notificationPreferencesStatus: status,
      }),
    setNotificationPreferencesStatus: (status) => set({ notificationPreferencesStatus: status }),
    setUser: (user) => {
      if (!isAuthenticatedUser(user)) {
        if (user === null) {
          set({ user: null });
        }

        return;
      }

      set((state) => ({
        notificationPreferences:
          state.notificationPreferencesStatus === "idle"
            ? getNotificationPreferencesFromUser(user)
            : state.notificationPreferences,
        user,
      }));
    },
    user: initialUser,
  }));
}

const fallbackAuthSessionStore = createAuthSessionStore();
const AuthSessionStoreContext = createContext<AuthSessionStore | null>(null);
let activeAuthSessionStore: AuthSessionStore | null = null;

function getWritableAuthSessionStore() {
  return activeAuthSessionStore ?? fallbackAuthSessionStore;
}

export function setAuthSessionUser(user: unknown) {
  getWritableAuthSessionStore().getState().setUser(user);
}

export function setAuthSessionNotificationPreferences(preferences: NotificationPreferences) {
  getWritableAuthSessionStore().getState().setNotificationPreferences(preferences);
}

type AuthSessionProviderProps = {
  children: ReactNode;
  initialNotificationPreferences?: NotificationPreferences | null;
  initialUser?: AuthenticatedUser | null;
};

export function AuthSessionProvider({
  children,
  initialNotificationPreferences,
  initialUser = null,
}: AuthSessionProviderProps) {
  const [store] = useState(() =>
    createAuthSessionStore({
      initialNotificationPreferences,
      initialUser,
    })
  );

  useEffect(() => {
    activeAuthSessionStore = store;

    return () => {
      if (activeAuthSessionStore === store) {
        activeAuthSessionStore = null;
      }
    };
  }, [store]);

  return (
    <AuthSessionStoreContext.Provider value={store}>
      {children}
    </AuthSessionStoreContext.Provider>
  );
}

export function useAuthSession<T>(selector: (state: AuthSessionState) => T) {
  const store = useContext(AuthSessionStoreContext) ?? fallbackAuthSessionStore;

  return useStore(store, selector);
}

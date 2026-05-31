import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { mockAuthenticatedUser } from "@/data/authenticated-user";
import { USER_PROFILES } from "@/types/user";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const profile = USER_PROFILES[mockAuthenticatedUser.profileCode];
  const firstName = mockAuthenticatedUser.fullName.split(" ")[0] ?? mockAuthenticatedUser.fullName;

  return (
    <div className="min-h-dvh bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col md:max-w-[72rem]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Maia
              </p>
              <h1 className="mt-1 truncate font-title text-xl font-semibold text-title">
                Olá, {firstName}
              </h1>
            </div>

            <div className="shrink-0 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
              {profile.label}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-28 pt-5 md:px-8 md:pb-32">{children}</main>
      </div>

      <BottomNavigation />
    </div>
  );
}

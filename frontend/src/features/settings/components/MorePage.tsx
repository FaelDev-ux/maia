"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellRing, ChevronRight, HelpCircle, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import type { HomeProfile } from "@/features/home/types";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";

type MorePageProps = {
  profile: HomeProfile;
};

const moreItems = [
  {
    href: "/privacidade-e-dados",
    icon: ShieldCheck,
    title: "Privacidade e dados",
    description: "Controle informações, armazenamento local e segurança.",
  },
  {
    href: "/ajuda-e-suporte",
    icon: HelpCircle,
    title: "Ajuda e suporte",
    description: "Encontre respostas e caminhos de acolhimento.",
  },
  {
    href: "/perfil",
    icon: LockKeyhole,
    title: "Conta e segurança",
    description: "Revise seus dados de cadastro e senha.",
  },
  {
    href: "/perfil",
    icon: BellRing,
    title: "Notificações",
    description: "Configure lembretes do check-in diário.",
  },
] as const;

export function MorePage({ profile }: MorePageProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/auth?mode=login");
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[48rem] md:overflow-visible md:px-8 md:pb-32">
        <SettingsHeader backHref="/home" profile={profile} />

        <div className="px-8 pb-8 pt-9 md:px-0 md:pt-10">
          <section aria-labelledby="more-title">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              Configurações
            </p>
            <h1
              className="mt-5 font-title text-[2.55rem] font-extrabold leading-[1.05] text-title"
              id="more-title"
            >
              Mais
            </h1>
            <p className="mt-6 max-w-[22rem] text-[1.06rem] leading-8 text-text md:max-w-[30rem] md:text-lg">
              Acesse preferências, privacidade e suporte para cuidar da sua experiência no Maia.
            </p>
          </section>

          <section className="mt-8 grid gap-4" aria-label="Opções adicionais">
            {moreItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-center gap-4 rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  href={getProfileScopedHref(item.href, profile)}
                  key={item.title}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon aria-hidden size={22} strokeWidth={2.3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-title text-lg font-extrabold text-title">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text">{item.description}</span>
                  </span>
                  <ChevronRight aria-hidden className="text-text/60" size={20} strokeWidth={2.4} />
                </Link>
              );
            })}

            <button
              className="flex items-center gap-4 rounded-[1.75rem] bg-white px-5 py-5 text-left shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-text">
                <LogOut aria-hidden size={22} strokeWidth={2.3} />
              </span>
              <span>
                <span className="block font-title text-lg font-extrabold text-title">
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </span>
                <span className="mt-1 block text-sm leading-6 text-text">
                  Encerrar sessão neste dispositivo.
                </span>
              </span>
            </button>
          </section>
        </div>
      </div>
      <BottomNavigation />
    </main>
  );
}

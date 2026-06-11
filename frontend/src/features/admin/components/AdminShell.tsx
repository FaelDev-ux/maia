"use client";

import type { ReactNode } from "react";
import {
  BookOpenText,
  ClipboardCheck,
  Home,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import cn from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

const adminNavigationItems = [
  {
    href: "/admin",
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/profissionais",
    label: "Profissionais",
    icon: ClipboardCheck,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: UsersRound,
  },
  {
    href: "/admin/comunidade",
    label: "Comunidade",
    icon: MessageSquare,
  },
  {
    href: "/home",
    label: "App",
    icon: Home,
  },
  {
    href: "/conteudos",
    label: "Conteudos",
    icon: BookOpenText,
  },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação administrativa"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <ul className="mx-auto grid h-16 w-full max-w-[34rem] grid-cols-6 items-center rounded-full border border-border/75 bg-white px-1 shadow-[0_18px_48px_rgb(140_64_84_/_0.14)] sm:h-20 sm:px-2">
        {adminNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "mx-auto grid size-10 place-items-center rounded-full text-text/80 transition hover:bg-primary/10 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-12",
                  isActive && "bg-primary/[0.12] text-primary"
                )}
                href={item.href}
                title={item.label}
              >
                <Icon aria-hidden className="size-[1.15rem] sm:size-[1.3rem]" strokeWidth={2.25} />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminShell({
  children,
  description,
  eyebrow = "Painel administrativo",
  title,
}: AdminShellProps) {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[76rem] pb-[6.5rem] sm:pb-[7.5rem] md:px-6 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-center bg-white px-4 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <MaiaBrand imageClassName="size-14" imageSize={58} />
        </header>

        <section className="px-4 pb-2 pt-7 sm:px-6 sm:pt-9 md:px-0 md:pt-10" aria-labelledby="admin-page-title">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
            <ShieldCheck aria-hidden size={15} strokeWidth={2.4} />
            {eyebrow}
          </p>
          <h1
            className="mt-5 max-w-full break-words font-title text-[2rem] font-extrabold leading-[1.08] text-title sm:text-[2.4rem] md:max-w-[42rem] md:text-[3.1rem]"
            id="admin-page-title"
          >
            {title}
          </h1>
          <p className="mt-5 max-w-[40rem] text-[1.02rem] leading-7 text-text md:text-lg md:leading-8">
            {description}
          </p>
        </section>

        <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-7 md:px-0 md:py-9">{children}</div>
      </div>

      <AdminBottomNavigation />
    </main>
  );
}

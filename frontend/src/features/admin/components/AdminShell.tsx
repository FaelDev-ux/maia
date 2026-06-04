"use client";

import type { ReactNode } from "react";
import { ClipboardCheck, LayoutDashboard, MessageSquare, ShieldCheck } from "lucide-react";
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
    href: "/admin/comunidade",
    label: "Comunidade",
    icon: MessageSquare,
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
      className="fixed inset-x-0 bottom-0 z-40 px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <ul className="mx-auto flex h-20 max-w-[22.4rem] items-center justify-center gap-6 rounded-full border border-border/75 bg-white px-2 shadow-[0_18px_48px_rgb(140_64_84_/_0.14)] md:max-w-[26rem]">
        {adminNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "mx-auto grid size-12 place-items-center rounded-full text-text/80 transition hover:bg-primary/10 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive && "bg-primary/[0.12] text-primary"
                )}
                href={item.href}
                title={item.label}
              >
                <Icon aria-hidden size={21} strokeWidth={2.25} />
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
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[28rem] pb-[7.5rem] md:max-w-[76rem] md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-center bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <MaiaBrand imageClassName="size-14" imageSize={58} />
        </header>

        <section className="px-8 pb-2 pt-9 md:px-0 md:pt-10" aria-labelledby="admin-page-title">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
            <ShieldCheck aria-hidden size={15} strokeWidth={2.4} />
            {eyebrow}
          </p>
          <h1
            className="mt-5 max-w-[24rem] font-title text-[2.75rem] font-extrabold leading-[1.02] text-title md:max-w-[38rem] md:text-[3.35rem]"
            id="admin-page-title"
          >
            {title}
          </h1>
          <p className="mt-5 max-w-[40rem] text-[1.02rem] leading-7 text-text md:text-lg md:leading-8">
            {description}
          </p>
        </section>

        <div className="px-6 py-7 md:px-0 md:py-9">{children}</div>
      </div>

      <AdminBottomNavigation />
    </main>
  );
}

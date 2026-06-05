"use client";

import { Suspense } from "react";
import {
  BookOpenText,
  ChartNoAxesColumnIncreasing,
  Home,
  MessageSquare,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import cn from "@/lib/utils";
import { getProfileScopedHref, resolveProfile } from "@/features/profile/utils/profile-routing";

const navigationItems = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/historico",
    label: "Histórico",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    href: "/comunidade",
    label: "Comunidade",
    icon: MessageSquare,
  },
  {
    href: "/conteudos",
    label: "Conteúdos",
    icon: BookOpenText,
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: UserRound,
  },
  {
    href: "/mais",
    label: "Mais",
    icon: MoreHorizontal,
  },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BottomNavigationContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profile = resolveProfile(searchParams.get("profile"));

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <ul className="mx-auto grid h-20 max-w-[25.5rem] grid-cols-6 items-center rounded-full border border-border/75 bg-white px-2 shadow-[0_18px_48px_rgb(140_64_84_/_0.14)] md:max-w-[34rem]">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = item.icon;
          const href = getProfileScopedHref(item.href, profile);

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "mx-auto grid size-12 place-items-center rounded-full text-text/80 transition hover:bg-primary/10 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive && "bg-primary/[0.12] text-primary"
                )}
                href={href}
                title={item.label}
              >
                <Icon aria-hidden size={20} strokeWidth={2.2} />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNavigation() {
  return (
    <Suspense fallback={null}>
      <BottomNavigationContent />
    </Suspense>
  );
}

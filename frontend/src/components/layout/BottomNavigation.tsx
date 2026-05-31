"use client";

import { BookOpen, Home, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "@/lib/utils";

const navigationItems = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/comunidade",
    label: "Comunidade",
    icon: UsersRound,
  },
  {
    href: "/conteudos",
    label: "Conteúdos",
    icon: BookOpen,
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: UserRound,
  },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgb(140_64_84_/_0.08)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-[30rem] grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-maia text-[0.68rem] font-semibold text-text/70 transition hover:bg-primary/10 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive && "bg-primary/10 text-primary"
                )}
                href={item.href}
              >
                <Icon aria-hidden size={20} strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

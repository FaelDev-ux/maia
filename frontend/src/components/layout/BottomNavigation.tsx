"use client";

import {
  BookOpenText,
  ChartNoAxesColumnIncreasing,
  Home,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { HomeProfile } from "@/features/home/types";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import cn from "@/lib/utils";

type NavigationItemId = "home" | "history" | "community" | "contents" | "profile" | "more" | "admin";

type NavigationItem = {
  id: NavigationItemId;
  href: string;
  label: string;
  icon: LucideIcon;
};

type BackendNavigationItem = {
  id?: string;
  href?: string;
  label?: string;
};

const navigationIconById: Record<NavigationItemId, LucideIcon> = {
  admin: ShieldCheck,
  community: MessageSquare,
  contents: BookOpenText,
  history: ChartNoAxesColumnIncreasing,
  home: Home,
  more: MoreHorizontal,
  profile: UserRound,
};

const defaultNavigationItems = [
  {
    id: "home",
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    id: "history",
    href: "/historico",
    label: "Historico",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    id: "community",
    href: "/comunidade",
    label: "Comunidade",
    icon: MessageSquare,
  },
  {
    id: "contents",
    href: "/conteudos",
    label: "Conteudos",
    icon: BookOpenText,
  },
  {
    id: "profile",
    href: "/perfil",
    label: "Perfil",
    icon: UserRound,
  },
  {
    id: "more",
    href: "/mais",
    label: "Mais",
    icon: MoreHorizontal,
  },
] satisfies NavigationItem[];

const defaultNavigationItemsByProfile: Record<HomeProfile, readonly NavigationItem[]> = {
  "experienced-mother": defaultNavigationItems.filter((item) => item.id !== "history"),
  "future-mother": defaultNavigationItems.filter((item) => item.id !== "history"),
  "health-professional": defaultNavigationItems.filter((item) => item.id !== "history"),
  "recent-mother": defaultNavigationItems,
};

function isNavigationItemId(id: string): id is NavigationItemId {
  return id in navigationIconById;
}

function normalizeBackendNavigation(items: unknown): NavigationItem[] | null {
  if (!Array.isArray(items)) {
    return null;
  }

  const normalized = items.flatMap((item: BackendNavigationItem) => {
    if (!item.id || !item.href || !item.label || !isNavigationItemId(item.id)) {
      return [];
    }

    return [
      {
        id: item.id,
        href: item.href,
        label: item.label,
        icon: navigationIconById[item.id],
      },
    ];
  });

  return normalized.length > 0 ? normalized : null;
}

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type BottomNavigationContentProps = {
  profile?: HomeProfile;
};

function BottomNavigationContent({ profile = "recent-mother" }: BottomNavigationContentProps) {
  const pathname = usePathname();
  const fallbackItems = defaultNavigationItemsByProfile[profile];
  const [backendNavigationItems, setBackendNavigationItems] = useState<readonly NavigationItem[] | null>(null);
  const navigationItems = backendNavigationItems ?? fallbackItems;

  useEffect(() => {
    let active = true;

    async function loadNavigation() {
      try {
        const response = await fetch("/api/navigation/", {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { navigation?: unknown };
        const nextItems = normalizeBackendNavigation(data.navigation);

        if (active && nextItems) {
          setBackendNavigationItems(nextItems);
        }
      } catch {
        // Keep the safe fallback if the navigation contract is temporarily unavailable.
      }
    }

    void loadNavigation();

    return () => {
      active = false;
    };
  }, [fallbackItems]);

  return (
    <nav
      aria-label="Navegacao principal"
      className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <ul
        className={cn(
          "mx-auto grid h-20 items-center rounded-full border border-border/75 bg-white px-2 shadow-[0_18px_48px_rgb(140_64_84_/_0.14)]",
          navigationItems.length > 6 ? "max-w-[38rem]" : "max-w-[25.5rem] md:max-w-[34rem]"
        )}
        style={{
          gridTemplateColumns: `repeat(${navigationItems.length}, minmax(0, 1fr))`,
        }}
      >
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = item.icon;
          const href =
            item.id === "admin" || item.id === "more"
              ? item.href
              : getProfileScopedHref(item.href, profile);

          return (
            <li key={item.id}>
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

type BottomNavigationProps = {
  profile?: HomeProfile;
};

export function BottomNavigation({ profile }: BottomNavigationProps) {
  return <BottomNavigationContent profile={profile} />;
}

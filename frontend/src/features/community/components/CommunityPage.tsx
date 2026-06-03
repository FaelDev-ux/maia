"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import logoMaia from "@/../public/images/logo-maia.png";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CommunityComposerCard } from "@/features/community/components/CommunityComposerCard";
import { CommunityCreatePostModal } from "@/features/community/components/CommunityCreatePostModal";
import { CommunityFilterChips } from "@/features/community/components/CommunityFilterChips";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import { communityFilters, communityPosts } from "@/features/community/data/community-posts";
import { COMMUNITY_CREATED_POSTS_STORAGE_KEY } from "@/features/community/data/community-storage";
import type { CommunityPost, CommunityPostCategory } from "@/features/community/types";
import type { HomeProfile } from "@/features/home/types";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";

type CommunityPageProps = {
  profile: HomeProfile;
};

const filterCategoryById: Record<string, CommunityPostCategory | "all"> = {
  all: "all",
  support: "apoio",
  sleep: "sono",
  network: "rede",
};

function getStoredCreatedPosts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedPosts = window.localStorage.getItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);

    if (!storedPosts) {
      return [];
    }

    const parsedPosts = JSON.parse(storedPosts) as CommunityPost[];
    const fixedPostIds = new Set(communityPosts.map((post) => post.id));

    return parsedPosts.filter((post) => !fixedPostIds.has(post.id));
  } catch {
    window.localStorage.removeItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);
    return [];
  }
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getPostSearchText(post: CommunityPost) {
  const searchableAuthor = post.isAnonymous ? "" : post.authorName;

  return normalizeSearchValue(
    [
      searchableAuthor,
      post.authorRole,
      post.categoryLabel,
      post.title,
      post.message,
      post.tags.join(" "),
    ].join(" ")
  );
}

export function CommunityPage({ profile }: CommunityPageProps) {
  const searchInputId = useId();
  const [posts, setPosts] = useState<CommunityPost[]>(() => [
    ...getStoredCreatedPosts(),
    ...communityPosts,
  ]);
  const [activeFilterId, setActiveFilterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const storedProfile = useStoredProfileValues(profile);
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = storedProfile.avatarUrl;
  const authorInitials = storedProfile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
  const activeCategory = filterCategoryById[activeFilterId] ?? "all";
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const visiblePosts = posts.filter((post) => {
    const matchesFilter = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      !normalizedSearchQuery || getPostSearchText(post).includes(normalizedSearchQuery);

    return matchesFilter && matchesSearch;
  });

  function handleCreatePost(post: CommunityPost) {
    setPosts((currentPosts) => {
      const updatedPosts = [post, ...currentPosts];
      const createdPosts = updatedPosts.filter((currentPost) =>
        currentPost.id.startsWith("mock-post-")
      );

      window.localStorage.setItem(
        COMMUNITY_CREATED_POSTS_STORAGE_KEY,
        JSON.stringify(createdPosts)
      );

      return updatedPosts;
    });
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <Image
            src={logoMaia}
            alt="Maia"
            width={58}
            height={58}
            className="size-14 object-contain"
            priority
          />
          <Link
            aria-label={`Perfil de ${firstName}`}
            className="grid size-[3.25rem] place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-lg font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            href={getProfileScopedHref("/perfil", profile)}
            title={`Perfil de ${firstName}`}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {avatarUrl ? null : avatarInitial}
          </Link>
        </header>

        <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
          <div>
            <section aria-labelledby="community-title">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                <Sparkles aria-hidden size={14} strokeWidth={2.4} />
                Espaço seguro
              </p>
              <h1
                className="mt-5 max-w-[22rem] font-title text-[2.12rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
                id="community-title"
              >
                Comunidade <span className="text-primary">Maia</span>
              </h1>
              <p className="mt-6 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                Encontre acolhimento, troque experiências e receba apoio de mães, mentoras e
                profissionais verificados.
              </p>
            </section>

            <section className="mt-8 md:mt-9" aria-label="Nova publicação na comunidade">
              <CommunityComposerCard onCreatePost={() => setIsCreatePostModalOpen(true)} />
            </section>
          </div>

          <div className="md:min-w-0">
            <section className="mt-8 md:mt-0" aria-labelledby="community-feed-heading">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                    Conversas recentes
                  </p>
                  <h2
                    className="mt-2 font-title text-2xl font-extrabold leading-tight text-title"
                    id="community-feed-heading"
                  >
                    Mural de apoio
                  </h2>
                </div>
              </div>

              <label className="relative mt-5 block" htmlFor={searchInputId}>
                <span className="sr-only">Buscar publicações</span>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text/55"
                  size={18}
                  strokeWidth={2.2}
                />
                <input
                  className="h-12 w-full rounded-full border border-border bg-white pl-11 pr-11 text-sm font-semibold text-title shadow-[0_10px_26px_rgb(140_64_84_/_0.08)] outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                  id={searchInputId}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar publicações"
                  type="search"
                  value={searchQuery}
                />
                {searchQuery ? (
                  <button
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-text transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => setSearchQuery("")}
                    type="button"
                  >
                    <X aria-hidden size={16} strokeWidth={2.4} />
                  </button>
                ) : null}
              </label>

              <div className="mt-6">
                <CommunityFilterChips
                  activeFilterId={activeFilterId}
                  filters={communityFilters}
                  onSelectFilter={setActiveFilterId}
                />
              </div>

              <div className="mt-6 grid gap-5">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <CommunityPostCard key={post.id} post={post} profile={profile} />
                  ))
                ) : (
                  <div className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
                    <p className="font-title text-xl font-extrabold text-title">
                      Nenhuma conversa encontrada
                    </p>
                    <p className="mt-3 text-sm leading-6 text-text">
                      Tente mudar o filtro ou buscar por outro termo.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <BottomNavigation />
      <CommunityCreatePostModal
        authorInitials={authorInitials || avatarInitial}
        authorName={storedProfile.fullName || "Usuária Maia"}
        authorRole="Mãe no puerpério"
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
      />
    </main>
  );
}

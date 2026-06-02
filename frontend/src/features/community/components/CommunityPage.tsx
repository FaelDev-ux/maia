"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import logoMaia from "@/../public/images/logo-maia.png";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { mockAuthenticatedUser } from "@/data/authenticated-user";
import { CommunityComposerCard } from "@/features/community/components/CommunityComposerCard";
import { CommunityCreatePostModal } from "@/features/community/components/CommunityCreatePostModal";
import { CommunityFilterChips } from "@/features/community/components/CommunityFilterChips";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import { communityFilters, communityPosts } from "@/features/community/data/community-posts";
import { COMMUNITY_CREATED_POSTS_STORAGE_KEY } from "@/features/community/data/community-storage";
import type { CommunityPost } from "@/features/community/types";

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

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(() => [
    ...getStoredCreatedPosts(),
    ...communityPosts,
  ]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const firstName = mockAuthenticatedUser.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = mockAuthenticatedUser.avatarUrl;
  const authorInitials = mockAuthenticatedUser.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

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
          <div
            aria-label={`Perfil de ${firstName}`}
            className="grid size-[3.25rem] place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-lg font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            role="img"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {avatarUrl ? null : avatarInitial}
          </div>
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

                <button
                  aria-label="Buscar publicações"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-text shadow-[0_10px_26px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:bg-primary/10 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  type="button"
                >
                  <Search aria-hidden size={20} strokeWidth={2.2} />
                </button>
              </div>

              <div className="mt-6">
                <CommunityFilterChips filters={communityFilters} />
              </div>

              <div className="mt-6 grid gap-5">
                {posts.map((post) => (
                  <CommunityPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <BottomNavigation />
      <CommunityCreatePostModal
        authorInitials={authorInitials || avatarInitial}
        authorName={mockAuthenticatedUser.fullName}
        authorRole="Mãe no puerpério"
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
      />
    </main>
  );
}

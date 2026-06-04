"use client";

import Link from "next/link";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { Search, Sparkles, Trash2, X } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import { CommunityComposerCard } from "@/features/community/components/CommunityComposerCard";
import { CommunityCreatePostModal } from "@/features/community/components/CommunityCreatePostModal";
import { CommunityFilterChips } from "@/features/community/components/CommunityFilterChips";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import { communityFilters, communityPosts } from "@/features/community/data/community-posts";
import {
  COMMUNITY_CREATED_POSTS_UPDATED_EVENT,
  COMMUNITY_REMOVED_POSTS_UPDATED_EVENT,
  getStoredCreatedCommunityPosts,
  getStoredRemovedPostIds,
  saveStoredCreatedCommunityPosts,
} from "@/features/community/data/community-storage";
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

  const fixedPostIds = new Set(communityPosts.map((post) => post.id));

  return getStoredCreatedCommunityPosts().filter((post) => !fixedPostIds.has(post.id));
}

function subscribeToCommunityPosts(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COMMUNITY_CREATED_POSTS_UPDATED_EVENT, onStoreChange);
  window.addEventListener(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COMMUNITY_CREATED_POSTS_UPDATED_EVENT, onStoreChange);
    window.removeEventListener(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT, onStoreChange);
  };
}

function getCommunityPostsSnapshot() {
  return JSON.stringify({
    createdPosts: getStoredCreatedPosts(),
    removedPostIds: getStoredRemovedPostIds(),
  });
}

function getCommunityPostsServerSnapshot() {
  return JSON.stringify({
    createdPosts: [],
    removedPostIds: [],
  });
}

function parseCommunityPostsSnapshot(snapshot: string) {
  try {
    const parsedSnapshot = JSON.parse(snapshot) as {
      createdPosts?: CommunityPost[];
      removedPostIds?: string[];
    };

    return {
      createdPosts: Array.isArray(parsedSnapshot.createdPosts)
        ? parsedSnapshot.createdPosts.filter((post) => typeof post.id === "string")
        : [],
      removedPostIds: Array.isArray(parsedSnapshot.removedPostIds)
        ? parsedSnapshot.removedPostIds.filter((postId): postId is string => typeof postId === "string")
        : [],
    };
  } catch {
    return {
      createdPosts: [],
      removedPostIds: [],
    };
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

function getCommunityComposerCopy(profile: HomeProfile) {
  if (profile === "health-professional") {
    return {
      buttonLabel: "Compartilhar orientação",
      defaultCategory: "profissional" as CommunityPostCategory,
      description:
        "Publique uma orientação geral, segura e acolhedora para ajudar mães e famílias sem substituir atendimento individual.",
      eyebrow: "Oriente com cuidado",
      messagePlaceholder:
        "Compartilhe uma orientação geral e cuidadosa. Evite diagnósticos e incentive busca de atendimento quando fizer sentido.",
      modalEyebrow: "Orientação profissional",
      submitLabel: "Publicar orientação",
      title: "Tem uma orientação que pode apoiar alguém?",
      titlePlaceholder: "Qual orientação pode ajudar a comunidade?",
    };
  }

  if (profile === "experienced-mother") {
    return {
      buttonLabel: "Compartilhar apoio",
      defaultCategory: "rede" as CommunityPostCategory,
      description:
        "Compartilhe uma vivência, uma ideia simples ou uma palavra de acolhimento para quem está atravessando uma fase parecida.",
      eyebrow: "Apoie com experiência",
      messagePlaceholder:
        "Conte uma experiência, uma frase de acolhimento ou um cuidado simples que pode ajudar outra mãe.",
      modalEyebrow: "Apoio da mentora",
      submitLabel: "Publicar apoio",
      title: "Pensou em algo que pode acolher alguém?",
      titlePlaceholder: "Que apoio você quer compartilhar?",
    };
  }

  return {
    buttonLabel: "Criar publicação",
    defaultCategory: "apoio" as CommunityPostCategory,
    description:
      "Publique uma dúvida, pedido de apoio ou experiência. Você pode preservar sua identidade quando preferir.",
    eyebrow: "Compartilhe com cuidado",
    messagePlaceholder:
      "Escreva com calma. Você pode pedir apoio, dividir uma experiência ou abrir uma conversa.",
    modalEyebrow: "Nova publicação",
    submitLabel: "Publicar",
    title: "Quer dividir o que está vivendo hoje?",
    titlePlaceholder: "O que você quer compartilhar?",
  };
}

function getCommunityAuthorRole(profile: HomeProfile) {
  if (profile === "health-professional") {
    return "Profissional de saúde";
  }

  if (profile === "experienced-mother") {
    return "Mãe mentora";
  }

  if (profile === "future-mother") {
    return "Futura mãe";
  }

  return "Mãe no puerpério";
}

function DeletePostConfirmationModal({
  onCancel,
  onConfirm,
  postTitle,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  postTitle: string;
}) {
  return (
    <div
      aria-labelledby="delete-post-confirmation-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-title/35 px-4 py-4 backdrop-blur-sm md:items-center"
      role="dialog"
    >
      <div className="w-full max-w-[24rem] rounded-[2rem] bg-background px-6 py-6 shadow-[0_24px_70px_rgb(57_55_56_/_0.22)] ring-1 ring-white/70">
        <div className="grid size-12 place-items-center rounded-full bg-danger/[0.12] text-danger">
          <Trash2 aria-hidden size={22} strokeWidth={2.3} />
        </div>
        <h2
          className="mt-4 font-title text-xl font-extrabold leading-tight text-title"
          id="delete-post-confirmation-title"
        >
          Excluir publicação?
        </h2>
        <p className="mt-3 text-sm leading-6 text-text">
          O post “{postTitle}” será removido do seu mural local e não aparecerá mais na comunidade.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="h-12 rounded-full bg-white px-4 text-sm font-extrabold text-text shadow-[0_8px_22px_rgb(140_64_84_/_0.07)] ring-1 ring-border transition hover:bg-surface/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="h-12 rounded-full bg-danger px-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgb(248_113_113_/_0.22)] transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            onClick={onConfirm}
            type="button"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommunityPage({ profile }: CommunityPageProps) {
  const searchInputId = useId();
  const communityPostsSnapshot = useSyncExternalStore(
    subscribeToCommunityPosts,
    getCommunityPostsSnapshot,
    getCommunityPostsServerSnapshot
  );
  const [activeFilterId, setActiveFilterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postPendingDeletion, setPostPendingDeletion] = useState<CommunityPost | null>(null);
  const { createdPosts, removedPostIds } = useMemo(
    () => parseCommunityPostsSnapshot(communityPostsSnapshot),
    [communityPostsSnapshot]
  );
  const posts = useMemo(() => {
    const removedPostIdsSet = new Set(removedPostIds);

    return [...createdPosts, ...communityPosts].filter((post) => !removedPostIdsSet.has(post.id));
  }, [createdPosts, removedPostIds]);
  const storedProfile = useStoredProfileValues(profile);
  const composerCopy = getCommunityComposerCopy(profile);
  const authorRole = getCommunityAuthorRole(profile);
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
  const userPosts = posts.filter((post) => post.id.startsWith("mock-post-"));
  const visiblePosts = posts.filter((post) => {
    const matchesFilter = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      !normalizedSearchQuery || getPostSearchText(post).includes(normalizedSearchQuery);

    return matchesFilter && matchesSearch;
  });

  function handleCreatePost(post: CommunityPost) {
    saveStoredCreatedCommunityPosts([
      post,
      ...createdPosts.filter((currentPost) => currentPost.id !== post.id),
    ]);
  }

  function handleConfirmDeletePost() {
    if (!postPendingDeletion) {
      return;
    }

    saveStoredCreatedCommunityPosts(
      createdPosts.filter((post) => post.id !== postPendingDeletion.id)
    );
    setPostPendingDeletion(null);
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <MaiaBrand imageClassName="size-14" imageSize={58} />
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
              <CommunityComposerCard
                buttonLabel={composerCopy.buttonLabel}
                description={composerCopy.description}
                eyebrow={composerCopy.eyebrow}
                onCreatePost={() => setIsCreatePostModalOpen(true)}
                title={composerCopy.title}
              />
            </section>
          </div>

          <div className="md:min-w-0">
            <section className="mt-8 md:mt-0" aria-labelledby="my-community-posts-heading">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                  Sua participação
                </p>
                <h2
                  className="mt-2 font-title text-2xl font-extrabold leading-tight text-title"
                  id="my-community-posts-heading"
                >
                  Meus posts
                </h2>
              </div>

              <div className="mt-5 grid gap-5">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <CommunityPostCard
                      key={post.id}
                      onDelete={() => setPostPendingDeletion(post)}
                      post={post}
                      profile={profile}
                    />
                  ))
                ) : (
                  <div className="rounded-[2rem] bg-white px-6 py-7 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
                    <p className="font-title text-xl font-extrabold text-title">
                      Você ainda não publicou por aqui
                    </p>
                    <p className="mt-3 text-sm leading-6 text-text">
                      Quando compartilhar algo na comunidade, seus posts aparecerão neste espaço.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-9" aria-labelledby="community-feed-heading">
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
        authorRole={authorRole}
        defaultCategory={composerCopy.defaultCategory}
        isOpen={isCreatePostModalOpen}
        messagePlaceholder={composerCopy.messagePlaceholder}
        modalEyebrow={composerCopy.modalEyebrow}
        onClose={() => setIsCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
        submitLabel={composerCopy.submitLabel}
        titlePlaceholder={composerCopy.titlePlaceholder}
      />
      {postPendingDeletion ? (
        <DeletePostConfirmationModal
          onCancel={() => setPostPendingDeletion(null)}
          onConfirm={handleConfirmDeletePost}
          postTitle={postPendingDeletion.title}
        />
      ) : null}
    </main>
  );
}

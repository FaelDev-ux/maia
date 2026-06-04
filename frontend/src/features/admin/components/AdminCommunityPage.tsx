"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, MessageSquare, Search, Trash2, X } from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { removeCommunityPost } from "@/features/admin/data/community-moderation";
import { useAdminCommunityPosts } from "@/features/admin/hooks/useAdminCommunityPosts";
import { communityComments } from "@/features/community/data/community-comments";
import type { CommunityComment, CommunityPost } from "@/features/community/types";
import { normalizeAdminSearch } from "@/features/admin/utils";

function getCommunityPostSearchText(post: CommunityPost) {
  const authorName = post.isAnonymous ? "" : post.authorName;

  return normalizeAdminSearch(
    [
      authorName,
      post.authorRole,
      post.categoryLabel,
      post.title,
      post.message,
      post.tags.join(" "),
    ].join(" ")
  );
}

function getCommentBalance(comment: CommunityComment) {
  return comment.helpfulCount - comment.notHelpfulCount;
}

function AdminCommunityPostModal({
  onClose,
  post,
}: {
  onClose: () => void;
  post: CommunityPost;
}) {
  const comments = communityComments
    .filter((comment) => comment.postId === post.id)
    .sort(
      (firstComment, secondComment) =>
        getCommentBalance(secondComment) - getCommentBalance(firstComment)
    );

  return (
    <div
      aria-labelledby="admin-community-post-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-title/35 px-4 py-4 backdrop-blur-sm md:items-center"
      role="dialog"
    >
      <div className="flex max-h-[min(42rem,calc(100dvh-2rem))] w-full max-w-[42rem] flex-col overflow-hidden rounded-[2rem] bg-background shadow-[0_24px_70px_rgb(57_55_56_/_0.22)] ring-1 ring-white/55">
        <header className="shrink-0 flex items-start justify-between gap-4 border-b border-border/70 bg-white px-5 py-5 md:px-6">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
              {post.categoryLabel}
            </p>
            <h2
              className="mt-3 font-title text-xl font-extrabold leading-tight text-title md:text-2xl"
              id="admin-community-post-modal-title"
            >
              {post.title}
            </h2>
          </div>
          <button
            aria-label="Fechar visualização"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-title ring-1 ring-border/75 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={19} strokeWidth={2.4} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6">
          <section className="rounded-[1.6rem] bg-white px-5 py-5 ring-1 ring-border/65">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-text/70">
              <span>{post.timeAgo}</span>
              <span>·</span>
              <span>{post.supportCount} apoios</span>
              <span>·</span>
              <span>{post.repliesCount} respostas</span>
            </div>
            <p className="mt-4 text-base leading-7 text-title">{post.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  className="rounded-full bg-background px-3 py-1 text-xs font-bold text-text ring-1 ring-border/65"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 font-title text-sm font-extrabold text-primary">
                {post.avatarInitials}
              </span>
              <div>
                <p className="font-title text-sm font-extrabold text-title">
                  {post.isAnonymous ? "Identidade protegida" : post.authorName}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-text">
                  {post.isAnonymous ? <EyeOff aria-hidden size={12} strokeWidth={2.4} /> : null}
                  {post.authorRole}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5" aria-labelledby="admin-comments-title">
            <h3 className="font-title text-lg font-extrabold text-title" id="admin-comments-title">
              Comentários
            </h3>
            <div className="mt-3 grid gap-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <article
                    className="rounded-[1.35rem] bg-white px-4 py-4 ring-1 ring-border/65"
                    key={comment.id}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                        {comment.avatarInitials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-title text-sm font-extrabold text-title">
                            {comment.isAnonymous ? "Usuária" : comment.authorName}
                          </h4>
                          <span className="text-xs font-semibold text-text/60">
                            {comment.timeAgo}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-text">
                          {comment.authorRole}
                        </p>
                      </div>
                      <span className="rounded-full bg-background px-2.5 py-1 text-xs font-extrabold text-title ring-1 ring-border/65">
                        {getCommentBalance(comment)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text">{comment.message}</p>
                  </article>
                ))
              ) : (
                <p className="rounded-[1.35rem] bg-white px-4 py-4 text-sm leading-6 text-text ring-1 ring-border/65">
                  Esta publicação ainda não possui comentários mockados.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AdminCommunityPage() {
  const posts = useAdminCommunityPosts();
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const normalizedSearch = normalizeAdminSearch(search);
  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          normalizedSearch.length === 0 ||
          getCommunityPostSearchText(post).includes(normalizedSearch)
      ),
    [normalizedSearch, posts]
  );

  return (
    <AdminShell
      description="Acompanhe publicações da comunidade e remova conteúdos que não devem permanecer visíveis no mural de apoio."
      eyebrow="Moderação"
      title="Comunidade"
    >
      <section aria-label="Busca de publicações">
        <div className="rounded-[2rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
          <label className="block text-sm font-extrabold text-title" htmlFor="community-search">
            Buscar publicação
          </label>
          <div className="mt-3 flex h-14 items-center gap-3 rounded-full bg-background px-4 ring-1 ring-border/80 focus-within:ring-2 focus-within:ring-primary">
            <Search aria-hidden className="shrink-0 text-primary" size={20} strokeWidth={2.3} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-title outline-none placeholder:text-text/55"
              id="community-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Título, categoria, tag ou conteúdo"
              type="search"
              value={search}
            />
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="admin-community-posts-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              className="font-title text-[1.45rem] font-extrabold text-title"
              id="admin-community-posts-title"
            >
              Posts da comunidade
            </h2>
            <p className="mt-1 text-sm leading-6 text-text">
              {filteredPosts.length} publicação
              {filteredPosts.length === 1 ? "" : "ões"} encontrada
              {filteredPosts.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                className="rounded-[1.85rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65"
                key={post.id}
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <MessageSquare aria-hidden size={22} strokeWidth={2.3} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                        {post.categoryLabel}
                      </span>
                      <span className="text-xs font-bold text-text/65">{post.timeAgo}</span>
                    </div>
                    <h3 className="mt-3 font-title text-lg font-extrabold leading-tight text-title">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text">{post.message}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-text/70">
                      <span>{post.supportCount} apoios</span>
                      <span>·</span>
                      <span>{post.repliesCount} respostas</span>
                      <span>·</span>
                      <span>{post.isAnonymous ? "Identidade protegida" : post.authorName}</span>
                    </div>
                  </div>
                </div>

                <footer className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border/70 pt-4">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-background px-4 text-sm font-extrabold text-title ring-1 ring-border/80 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => setSelectedPost(post)}
                    type="button"
                  >
                    <Eye aria-hidden size={17} strokeWidth={2.3} />
                    Abrir
                  </button>
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-danger px-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgb(248_113_113_/_0.22)] transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                    onClick={() => removeCommunityPost(post.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden size={17} strokeWidth={2.3} />
                    Excluir
                  </button>
                </footer>
              </article>
            ))
          ) : (
            <div className="rounded-[1.9rem] bg-white px-6 py-8 text-center shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
              <h3 className="font-title text-lg font-extrabold text-title">
                Nenhum post encontrado
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text">
                Ajuste a busca para revisar outros conteúdos da comunidade.
              </p>
            </div>
          )}
        </div>
      </section>
      {selectedPost ? (
        <AdminCommunityPostModal onClose={() => setSelectedPost(null)} post={selectedPost} />
      ) : null}
    </AdminShell>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowBigDown, ArrowLeft, ArrowBigUp, EyeOff, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import logoMaia from "@/../public/images/logo-maia.png";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { mockAuthenticatedUser } from "@/data/authenticated-user";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import { communityComments } from "@/features/community/data/community-comments";
import { COMMUNITY_CREATED_POSTS_STORAGE_KEY } from "@/features/community/data/community-storage";
import type { CommunityComment, CommunityPost } from "@/features/community/types";
import type { HomeProfile } from "@/features/home/types";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import cn from "@/lib/utils";

type CommunityPostDetailPageProps = {
  initialPost?: CommunityPost;
  postId: string;
  profile: HomeProfile;
};

function getStoredPost(postId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedPosts = window.localStorage.getItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);
    const parsedPosts = storedPosts ? (JSON.parse(storedPosts) as CommunityPost[]) : [];

    return parsedPosts.find((currentPost) => currentPost.id === postId) ?? null;
  } catch {
    return null;
  }
}

function getDisplayName(comment: CommunityComment) {
  return comment.isAnonymous ? "Usuária" : comment.authorName;
}

function getCommentSupportBalance(comment: CommunityComment) {
  return comment.helpfulCount - comment.notHelpfulCount;
}

function sortCommentsBySupport(comments: CommunityComment[]) {
  return [...comments].sort((firstComment, secondComment) => {
    const scoreDifference =
      getCommentSupportBalance(secondComment) - getCommentSupportBalance(firstComment);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return secondComment.helpfulCount - firstComment.helpfulCount;
  });
}

export function CommunityPostDetailPage({
  initialPost,
  postId,
  profile,
}: CommunityPostDetailPageProps) {
  const router = useRouter();
  const commentsSectionRef = useRef<HTMLElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [post] = useState<CommunityPost | null>(() => initialPost ?? getStoredPost(postId));
  const [comments, setComments] = useState(() =>
    initialPost || post ? communityComments.filter((comment) => comment.postId === postId) : []
  );
  const [message, setMessage] = useState("");
  const storedProfile = useStoredProfileValues(profile);
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = storedProfile.avatarUrl;
  const sortedComments = sortCommentsBySupport(comments);
  const highlightedComment = sortedComments[0];
  const highlightedPost = post
    ? {
        ...post,
        highlightedReply: highlightedComment
          ? {
              authorName: getDisplayName(highlightedComment),
              authorRole: highlightedComment.isAnonymous
                ? "Publicação protegida"
                : highlightedComment.authorRole,
              message: highlightedComment.message,
            }
          : post.highlightedReply,
      }
    : null;

  const focusComments = useCallback(() => {
    commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    messageInputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#comentarios") {
      return;
    }

    focusComments();
  }, [focusComments]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 2) {
      return;
    }

    const initials = storedProfile.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("");

    setComments((currentComments) => [
      {
        id: `mock-comment-${Date.now()}`,
        postId,
        authorName: storedProfile.fullName || mockAuthenticatedUser.fullName,
        authorRole: "Mãe no puerpério",
        avatarInitials: initials || avatarInitial,
        message: trimmedMessage,
        timeAgo: "agora",
        helpfulCount: 0,
        notHelpfulCount: 0,
      },
      ...currentComments,
    ]);
    setMessage("");
  }

  function handleCommentVote(commentId: string, vote: NonNullable<CommunityComment["userVote"]>) {
    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        const nextComment = { ...comment };

        if (nextComment.userVote === "helpful") {
          nextComment.helpfulCount -= 1;
        }

        if (nextComment.userVote === "not-helpful") {
          nextComment.notHelpfulCount -= 1;
        }

        nextComment.userVote = nextComment.userVote === vote ? undefined : vote;

        if (nextComment.userVote === "helpful") {
          nextComment.helpfulCount += 1;
        }

        if (nextComment.userVote === "not-helpful") {
          nextComment.notHelpfulCount += 1;
        }

        return nextComment;
      })
    );
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] pb-[7.5rem] md:max-w-[48rem] md:px-8 md:pb-32">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-6 md:mt-6 md:h-20 md:rounded-[2rem] md:px-8 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <button
            aria-label="Voltar para a comunidade"
            className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => router.push(getProfileScopedHref("/comunidade", profile))}
            type="button"
          >
            <ArrowLeft aria-hidden size={21} strokeWidth={2.4} />
          </button>

          <Image
            src={logoMaia}
            alt="Maia"
            width={54}
            height={54}
            className="size-13 object-contain"
            priority
          />

          <Link
            aria-label={`Perfil de ${firstName}`}
            className="grid size-11 place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-base font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            href={getProfileScopedHref("/perfil", profile)}
            title={`Perfil de ${firstName}`}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {avatarUrl ? null : avatarInitial}
          </Link>
        </header>

        <div className="px-6 pb-8 pt-7 md:px-0 md:pt-9">
          <section aria-labelledby="community-post-title">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              <MessageCircle aria-hidden size={14} strokeWidth={2.4} />
              Conversa aberta
            </p>
            <h1
              className="mt-4 font-title text-2xl font-extrabold leading-tight text-title md:text-3xl"
              id="community-post-title"
            >
              Publicação da comunidade
            </h1>
          </section>

          {highlightedPost ? (
            <section className="mt-6" aria-label="Publicação aberta">
              <CommunityPostCard onReply={focusComments} post={highlightedPost} variant="detail" />
            </section>
          ) : null}

          <section
            aria-labelledby="comments-title"
            className="mt-7 rounded-[2rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:px-7"
            id="comentarios"
            ref={commentsSectionRef}
            tabIndex={-1}
          >
            {!post ? (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                  Conversa indisponível
                </p>
                <h2 className="mt-2 font-title text-2xl font-extrabold leading-tight text-title">
                  Publicação não encontrada
                </h2>
                <p className="mt-3 text-sm leading-6 text-text">
                  Essa conversa pode ter sido removida ou ainda não está sincronizada com os dados
                  mockados.
                </p>
              </div>
            ) : null}

            {post ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                      Comentários
                    </p>
                    <h2
                      className="mt-2 font-title text-2xl font-extrabold leading-tight text-title"
                      id="comments-title"
                    >
                      Respostas da comunidade
                    </h2>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
                    {comments.length}
                  </span>
                </div>

                <form className="mt-5" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="text-sm font-extrabold text-title">Escrever resposta</span>
                    <textarea
                      className="mt-2 min-h-28 w-full resize-none rounded-[1.35rem] border border-border bg-background px-4 py-4 text-base leading-7 text-title outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                      maxLength={360}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Compartilhe apoio, experiência ou uma ideia simples."
                      ref={messageInputRef}
                      value={message}
                    />
                  </label>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-text/60">{message.length}/360</span>
                    <button
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
                      disabled={message.trim().length < 2}
                      type="submit"
                    >
                      <Send aria-hidden size={16} strokeWidth={2.4} />
                      Enviar
                    </button>
                  </div>
                </form>

                <div className="mt-6 grid gap-4">
                  {sortedComments.length > 0 ? (
                    sortedComments.map((comment, index) => {
                      const displayName = getDisplayName(comment);
                      const supportBalance = getCommentSupportBalance(comment);

                      return (
                        <article
                          className="rounded-[1.45rem] bg-background px-4 py-4 ring-1 ring-border/70"
                          key={comment.id}
                        >
                          <header className="flex items-start gap-3">
                            <span
                              aria-label={`Perfil de ${displayName}`}
                              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-extrabold text-primary ring-1 ring-primary/25"
                              role="img"
                            >
                              {comment.avatarInitials}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h3
                                  aria-label={
                                    comment.isAnonymous ? "Usuária com nome oculto" : undefined
                                  }
                                  className="font-title text-sm font-extrabold text-title"
                                >
                                  <span
                                    aria-hidden={comment.isAnonymous ? true : undefined}
                                    className={cn(
                                      comment.isAnonymous && "inline-block select-none blur-[2px]"
                                    )}
                                  >
                                    {displayName}
                                  </span>
                                </h3>
                                <span className="text-xs font-semibold text-text/60">
                                  - {comment.timeAgo}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  "mt-0.5 text-xs font-semibold text-text",
                                  comment.isAnonymous &&
                                    "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap"
                                )}
                              >
                                {comment.isAnonymous ? (
                                  <EyeOff aria-hidden size={12} strokeWidth={2.4} />
                                ) : null}
                                <span>
                                  {comment.isAnonymous
                                    ? "Publicação protegida"
                                    : comment.authorRole}
                                </span>
                              </p>
                            </div>
                          </header>
                          <p className="mt-3 text-sm leading-6 text-text">{comment.message}</p>

                          <footer className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
                            <div>
                              {index === 0 ? (
                                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-primary">
                                  Resposta em destaque
                                </p>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-4 place-items-center rounded-full bg-white text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.08)] ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                              <button
                                aria-label={`Marcar resposta de ${displayName} como útil`}
                                className={cn(
                                  "size-10 flex items-center justify-center rounded-full",
                                  comment.userVote === "helpful" &&
                                    "bg-primary text-white hover:bg-primary/90"
                                )}
                                onClick={() => handleCommentVote(comment.id, "helpful")}
                                type="button"
                              >
                                <ArrowBigUp aria-hidden size={18} strokeWidth={2.5} />
                              </button>
                              <p
                                className={cn(
                                  "mt-1 text-sm font-extrabold",
                                  supportBalance < 0 ? "text-danger" : "text-title"
                                )}
                              >
                                {supportBalance > 0 ? `+${supportBalance}` : supportBalance}
                              </p>
                              <button
                                aria-label={`Marcar resposta de ${displayName} como não útil`}
                                className={cn(
                                  "size-10 flex items-center justify-center rounded-full",
                                  comment.userVote === "not-helpful" &&
                                    "bg-danger text-white hover:bg-danger/90"
                                )}
                                onClick={() => handleCommentVote(comment.id, "not-helpful")}
                                type="button"
                              >
                                <ArrowBigDown aria-hidden size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </footer>
                        </article>
                      );
                    })
                  ) : (
                    <p className="rounded-[1.45rem] bg-background px-4 py-4 text-sm leading-6 text-text">
                      Ainda não há respostas. Você pode ser a primeira pessoa a acolher essa
                      conversa.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}

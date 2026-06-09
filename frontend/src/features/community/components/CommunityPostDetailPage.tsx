"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowBigDown, ArrowBigUp, ArrowLeft, EyeOff, Send } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import {
  createCommunityComment,
  fetchCommunityPostDetail,
  sendCommentFeedback,
} from "@/features/community/services";
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

function getDisplayName(comment: CommunityComment) {
  return comment.isAnonymous ? "Usuaria" : comment.authorName;
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
  const commentsSectionRef = useRef<HTMLElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const storedProfile = useStoredProfileValues(profile);
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = storedProfile.avatarUrl;
  const [post, setPost] = useState<CommunityPost | null>(initialPost ?? null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const sortedComments = useMemo(() => sortCommentsBySupport(comments), [comments]);
  const highlightedComment = sortedComments[0];
  const highlightedPost = post
    ? {
        ...post,
        highlightedReply: highlightedComment
          ? {
              authorName: getDisplayName(highlightedComment),
              authorRole: highlightedComment.isAnonymous
                ? "Publicacao protegida"
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
    let isMounted = true;

    async function loadPostDetail() {
      setIsLoading(true);
      setLoadError("");

      try {
        const detail = await fetchCommunityPostDetail(postId);

        if (isMounted) {
          setPost(detail.post);
          setComments(detail.comments);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : "Nao foi possivel carregar esta conversa."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPostDetail();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    if (window.location.hash === "#comentarios") {
      focusComments();
    }
  }, [focusComments]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    setSubmitError("");

    if (trimmedMessage.length < 2) {
      return;
    }

    try {
      const comment = await createCommunityComment(postId, trimmedMessage);

      if (comment) {
        setComments((currentComments) => [...currentComments, comment]);
      }

      setMessage("");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Nao foi possivel enviar sua resposta agora."
      );
    }
  }

  async function handleCommentVote(
    commentId: string,
    vote: NonNullable<CommunityComment["userVote"]>
  ) {
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

    try {
      await sendCommentFeedback(commentId, vote);
    } catch {
      // Mantem o feedback visual quando a sincronizacao falha momentaneamente.
    }
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-6 md:mt-6 md:h-20 md:rounded-[2rem] md:px-8 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <Link
            aria-label="Voltar para comunidade"
            className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href={getProfileScopedHref("/comunidade", profile)}
          >
            <ArrowLeft aria-hidden size={21} strokeWidth={2.4} />
          </Link>

          <MaiaBrand imageClassName="size-13" imageSize={54} textClassName="text-2xl" />

          <Link
            aria-label={`Perfil de ${firstName}`}
            className="grid size-11 place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-base font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            href={getProfileScopedHref("/perfil", profile)}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {avatarUrl ? null : avatarInitial}
          </Link>
        </header>

        <div className="px-6 pb-8 pt-7 md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
          <section aria-label="Publicacao da comunidade">
            {highlightedPost ? (
              <CommunityPostCard
                onReply={focusComments}
                post={highlightedPost}
                profile={profile}
                variant="detail"
              />
            ) : (
              <div className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                  Conversa indisponivel
                </p>
                <h2 className="mt-2 font-title text-2xl font-extrabold leading-tight text-title">
                  Publicacao nao encontrada
                </h2>
                <p className="mt-3 text-sm leading-6 text-text">
                  Essa conversa pode ter sido removida ou ainda nao esta disponivel.
                </p>
              </div>
            )}
          </section>

          <section
            aria-labelledby="comments-title"
            className="mt-7 rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:mt-0 md:px-7"
            id="comentarios"
            ref={commentsSectionRef}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                  Comentarios
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

            {isLoading ? (
              <p className="mt-5 rounded-[1.45rem] bg-background px-4 py-4 text-sm leading-6 text-text">
                Carregando respostas...
              </p>
            ) : loadError ? (
              <p className="mt-5 rounded-[1.45rem] bg-primary/10 px-4 py-4 text-sm font-bold leading-6 text-primary">
                {loadError}
              </p>
            ) : post ? (
              <>
                <form className="mt-5" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="text-sm font-extrabold text-title">Escrever resposta</span>
                    <textarea
                      className="mt-2 min-h-28 w-full resize-none rounded-[1.35rem] border border-border bg-background px-4 py-4 text-base leading-7 text-title outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                      maxLength={360}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Compartilhe apoio, experiencia ou uma ideia simples."
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
                  {submitError ? (
                    <p className="mt-3 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold leading-6 text-primary">
                      {submitError}
                    </p>
                  ) : null}
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
                                <h3 className="font-title text-sm font-extrabold text-title">
                                  <span
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
                              <p className="mt-0.5 inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-text">
                                {comment.isAnonymous ? (
                                  <EyeOff aria-hidden size={12} strokeWidth={2.4} />
                                ) : null}
                                <span>
                                  {comment.isAnonymous ? "Publicacao protegida" : comment.authorRole}
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

                            <div className="flex items-center gap-3 rounded-full bg-white px-2 text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.08)] ring-1 ring-border">
                              <button
                                aria-label={`Marcar resposta de ${displayName} como util`}
                                className={cn(
                                  "grid size-10 place-items-center rounded-full",
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
                                  "text-sm font-extrabold",
                                  supportBalance < 0 ? "text-danger" : "text-title"
                                )}
                              >
                                {supportBalance > 0 ? `+${supportBalance}` : supportBalance}
                              </p>
                              <button
                                aria-label={`Marcar resposta de ${displayName} como nao util`}
                                className={cn(
                                  "grid size-10 place-items-center rounded-full",
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
                      Ainda nao ha respostas. Voce pode ser a primeira pessoa a acolher essa
                      conversa.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>

      <BottomNavigation profile={profile} />
    </main>
  );
}

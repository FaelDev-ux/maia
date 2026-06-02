"use client";

import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EyeOff, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CommunityPost } from "@/features/community/types";
import cn from "@/lib/utils";

type CommunityPostCardProps = {
  onReply?: () => void;
  post: CommunityPost;
  variant?: "feed" | "detail";
};

export function CommunityPostCard({ onReply, post, variant = "feed" }: CommunityPostCardProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [isSupported, setIsSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(post.supportCount);
  const displayName = post.isAnonymous ? "Usuária" : post.authorName;
  const displayRole = post.isAnonymous ? "Publicação protegida" : post.authorRole;
  const isInteractive = variant === "feed";
  const postUrl = `/comunidade/${post.id}`;

  function openPost(comments = false) {
    if (!isInteractive) {
      return;
    }

    router.push(comments ? `${postUrl}#comentarios` : postUrl);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isInteractive || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    openPost();
  }

  function handleSupportClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const nextSupportedValue = !isSupported;

    setIsSupported(nextSupportedValue);
    setSupportCount((currentCount) => currentCount + (nextSupportedValue ? 1 : -1));
  }

  function handleReplyClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!isInteractive) {
      onReply?.();
      return;
    }

    openPost(true);
  }

  return (
    <article
      className={cn(
        "rounded-[2.15rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.11)] ring-1 ring-border/65 transition md:px-7",
        isInteractive &&
          "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgb(140_64_84_/_0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      )}
      onClick={() => openPost()}
      onKeyDown={handleCardKeyDown}
      role={isInteractive ? "link" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <header className="flex items-start gap-4">
        <span
          aria-label={`Perfil de ${displayName}`}
          className="grid size-12 shrink-0 place-items-center rounded-full border-[3px] border-white bg-primary/15 text-sm font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.13)] ring-2 ring-primary/35"
          role="img"
        >
          {post.avatarInitials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              aria-label={post.isAnonymous ? "Usuária com nome oculto" : undefined}
              className="font-title text-base font-extrabold leading-tight text-title"
            >
              <span
                aria-hidden={post.isAnonymous ? true : undefined}
                className={cn(post.isAnonymous && "inline-block select-none blur-[2px]")}
              >
                {displayName}
              </span>
            </h2>
            <span className="text-xs font-semibold text-text/70">- {post.timeAgo}</span>
          </div>
          <p
            className={cn(
              "mt-1 text-xs font-semibold text-text",
              post.isAnonymous && "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap"
            )}
          >
            {post.isAnonymous ? <EyeOff aria-hidden size={13} strokeWidth={2.4} /> : null}
            <span>{displayRole}</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-primary">
          {post.categoryLabel}
        </span>
      </header>

      <div className="mt-5">
        <h3 className="font-title text-xl font-extrabold leading-tight text-title">{post.title}</h3>
        <p className="mt-4 text-[0.95rem] leading-7 text-text">{post.message}</p>
      </div>

      {post.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              className="rounded-full bg-surface/70 px-3 py-1.5 text-xs font-bold text-text"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {post.highlightedReply ? (
        <aside className="mt-5 rounded-[1.45rem] bg-primary/[0.08] px-4 py-4 ring-1 ring-primary/15">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck aria-hidden size={16} strokeWidth={2.3} />
            <p className="text-xs font-extrabold uppercase tracking-[0.08em]">
              Resposta em destaque
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-text">{post.highlightedReply.message}</p>
          <p className="mt-3 text-xs font-bold text-title">
            {post.highlightedReply.authorName} - {post.highlightedReply.authorRole}
          </p>
        </aside>
      ) : null}

      <footer className="mt-6 border-t border-border/70 pt-5">
        <p className="text-sm font-extrabold text-title">
          {supportCount} {supportCount === 1 ? "apoio" : "apoios"}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <motion.button
            aria-label={`${isSupported ? "Remover apoio" : "Apoiar publicação"}. ${supportCount} apoios`}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: isSupported ? [1, 1.18, 1] : 1,
                  }
            }
            className={cn(
              "grid size-12 flex-1 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isSupported && "bg-primary text-white hover:bg-primary/90"
            )}
            onClick={handleSupportClick}
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          >
            <Heart
              aria-hidden
              className={cn(isSupported ? "fill-white" : "fill-primary")}
              size={22}
              strokeWidth={isSupported ? 0 : 2.1}
            />
          </motion.button>

          <button
            aria-label={`Responder publicação. ${post.repliesCount} respostas`}
            className="grid size-12 flex-1 place-items-center rounded-full bg-surface/65 text-text transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={handleReplyClick}
            type="button"
          >
            <MessageCircle aria-hidden size={23} strokeWidth={2.2} />
          </button>
        </div>
      </footer>
    </article>
  );
}

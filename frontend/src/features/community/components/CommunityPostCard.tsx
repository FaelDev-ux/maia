import { Heart, MessageCircle, ShieldCheck } from "lucide-react";
import type { CommunityPost } from "@/features/community/types";

type CommunityPostCardProps = {
  post: CommunityPost;
};

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const displayName = post.isAnonymous ? "Identidade protegida" : post.authorName;

  return (
    <article className="rounded-[2.15rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.11)] ring-1 ring-border/65 md:px-7">
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
            <h2 className="font-title text-base font-extrabold leading-tight text-title">
              {displayName}
            </h2>
            <span className="text-xs font-semibold text-text/70">• {post.timeAgo}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-text">{post.authorRole}</p>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-primary">
          {post.categoryLabel}
        </span>
      </header>

      <div className="mt-5">
        <h3 className="font-title text-xl font-extrabold leading-tight text-title">
          {post.title}
        </h3>
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
            {post.highlightedReply.authorName} · {post.highlightedReply.authorRole}
          </p>
        </aside>
      ) : null}

      <footer className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
        <button
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary/10 px-4 text-sm font-extrabold text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="button"
        >
          <Heart aria-hidden className="fill-primary" size={16} strokeWidth={0} />
          Apoiar {post.supportCount}
        </button>

        <button
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-surface/65 px-4 text-sm font-extrabold text-text transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="button"
        >
          <MessageCircle aria-hidden size={17} strokeWidth={2.2} />
          Responder {post.repliesCount}
        </button>
      </footer>
    </article>
  );
}

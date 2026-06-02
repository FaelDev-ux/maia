import type { CommunityPreview } from "@/features/home/types";
import { useRouter } from "next/navigation"

type CommunityPreviewCardProps = {
  community: CommunityPreview;
  onClick: () => void;
};

export function CommunityPreviewCard({ community,   onClick }: CommunityPreviewCardProps) {
  return (
    <article className="rounded-[2.35rem] bg-white px-7 py-8 shadow-[0_18px_52px_rgb(140_64_84_/_0.12)] ring-1 ring-border/65 md:px-8 md:py-9">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center">
          {community.avatars.map((avatar, index) => (
            <span
              className="-ml-2 first:ml-0"
              key={avatar}
              style={{ zIndex: community.avatars.length - index }}
            >
              <span
                className="block size-10 rounded-full border-2 border-white bg-cover bg-center"
                style={{ backgroundImage: `url(${avatar})` }}
              />
            </span>
          ))}
          <span className="-ml-2 grid size-10 place-items-center rounded-full border-2 border-white bg-tertiary/55 text-xs font-extrabold text-tertiary">
            +12
          </span>
        </div>

        <span className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-primary">
          Atividade recente
        </span>
      </div>

      <h2 className="mt-6 font-title text-xl font-extrabold leading-tight text-title">
        {community.title}
      </h2>
      <p className="mt-5 max-w-[31rem] text-base leading-7 text-text">
        {community.topic} {community.activeMothers} mães participando agora.
      </p>

      <button
        className="mt-7 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        type="button"
        onClick={onClick}
      >
        Participar da Conversa
      </button>
    </article>
  );
}

import { Heart, SmilePlus } from "lucide-react";
import type { HelpRequest } from "@/features/home/types";

type HelpRequestCardProps = {
  request: HelpRequest;
};

export function HelpRequestCard({ request }: HelpRequestCardProps) {
  return (
    <article className="rounded-[1.75rem] bg-surface/55 px-5 py-5 ring-1 ring-border/50">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          {request.urgent ? (
            <Heart aria-hidden className="fill-primary" size={16} strokeWidth={0} />
          ) : (
            <SmilePlus aria-hidden size={17} strokeWidth={2.4} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-title text-base font-extrabold leading-tight text-title">
                {request.title}
              </h3>
              <p className="mt-1 text-[0.72rem] font-medium text-text">
                {request.timeAgo} - {request.category}
              </p>
            </div>

            {request.urgent ? (
              <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.08em] text-primary">
                Urgente
              </span>
            ) : null}
          </div>

          <p className="mt-4 text-sm leading-6 text-text">{request.message}</p>
        </div>
      </div>
    </article>
  );
}

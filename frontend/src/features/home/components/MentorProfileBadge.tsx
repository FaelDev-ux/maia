import { Sparkles } from "lucide-react";

type MentorProfileBadgeProps = {
  badge: string;
  secondaryLabel: string;
};

export function MentorProfileBadge({ badge, secondaryLabel }: MentorProfileBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex h-8 items-center gap-2 rounded-full bg-primary/10 px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-secondary">
        <Sparkles aria-hidden size={12} strokeWidth={2.4} />
        {badge}
      </span>
      <span className="text-xs font-medium text-text">{secondaryLabel}</span>
    </div>
  );
}

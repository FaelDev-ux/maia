import { ChartNoAxesColumnIncreasing } from "lucide-react";
import type { WeeklyInsight } from "@/features/home/types";

type WeeklyInsightCardProps = {
  insight: WeeklyInsight;
};

export function WeeklyInsightCard({ insight }: WeeklyInsightCardProps) {
  return (
    <article className="rounded-[2.35rem] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--maia-primary)_22%,white)_0%,color-mix(in_srgb,var(--maia-primary)_12%,white)_45%,color-mix(in_srgb,var(--maia-secondary)_10%,white)_100%)] px-8 py-8 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.55)]">
      <div className="grid size-14 place-items-center rounded-full bg-white text-secondary shadow-[0_14px_32px_rgb(140_64_84_/_0.12)]">
        <ChartNoAxesColumnIncreasing aria-hidden size={22} strokeWidth={2.6} />
      </div>

      <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.14em] text-secondary">
        {insight.eyebrow}
      </p>
      <p className="mt-3 max-w-[17rem] text-[1.25rem] font-medium leading-[1.45] text-secondary">
        {insight.message}
      </p>
    </article>
  );
}

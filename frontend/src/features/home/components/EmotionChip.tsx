import Link from "next/link";
import type { EmotionOption } from "@/features/home/types";

type EmotionChipProps = {
  emotion: EmotionOption;
};

export function EmotionChip({ emotion }: EmotionChipProps) {
  return (
    <Link
      className="flex h-[3.75rem] items-center gap-2 rounded-full bg-white px-5 text-[1.06rem] font-medium text-title shadow-[0_10px_26px_rgb(140_64_84_/_0.08)] ring-1 ring-border/45 transition hover:-translate-y-0.5 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      href={`/check-in?emotion=${emotion.id}`}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {emotion.emoji}
      </span>
      <span>{emotion.label}</span>
    </Link>
  );
}

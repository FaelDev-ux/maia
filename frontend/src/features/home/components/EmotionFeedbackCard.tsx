import { CheckCircle2, Heart } from "lucide-react";
import type { EmotionOption } from "@/features/home/types";

export type EmotionFeedback = {
  title: string;
  message: string;
};

type EmotionFeedbackCardProps = {
  emotion: EmotionOption;
  feedback: EmotionFeedback;
};

export function EmotionFeedbackCard({ emotion, feedback }: EmotionFeedbackCardProps) {
  return (
    <div
      aria-live="polite"
      className="w-full rounded-[2rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:max-w-[23rem]"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl">
          <span aria-hidden>{emotion.emoji}</span>
        </span>
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
            <CheckCircle2 aria-hidden size={14} strokeWidth={2.4} />
            Registro salvo
          </p>
          <h2 className="mt-2 font-title text-2xl font-extrabold leading-tight text-title">
            {feedback.title}
          </h2>
        </div>
      </div>

      <p className="mt-5 text-[1.02rem] leading-7 text-text">{feedback.message}</p>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-extrabold text-primary">
        <Heart aria-hidden className="fill-primary" size={15} strokeWidth={0} />
        Sentimento registrado: {emotion.label}
      </p>
    </div>
  );
}

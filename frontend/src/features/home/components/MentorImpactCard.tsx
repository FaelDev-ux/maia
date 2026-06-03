import { Heart } from "lucide-react";

type MentorImpactCardProps = {
  description: string;
  label: string;
  value: number;
};

export function MentorImpactCard({ description, label, value }: MentorImpactCardProps) {
  return (
    <article className="rounded-[2.35rem] bg-white px-8 py-8 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/60">
      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Heart aria-hidden className="fill-primary" size={18} strokeWidth={0} />
        </span>
        <p className="text-base font-medium text-text">{label}</p>
      </div>

      <div className="mt-7 flex items-end gap-4">
        <strong className="font-title text-5xl font-extrabold leading-none text-primary">
          {value}
        </strong>
        <span className="pb-1 text-base font-semibold text-title">Mães apoiadas</span>
      </div>

      <p className="mt-5 text-sm leading-6 text-text">{description}</p>
    </article>
  );
}

import { Heart } from "lucide-react";

type MentorImpactCardProps = {
  description: string;
  emptyMessage?: string;
  label: string;
  secondaryLabel?: string;
  secondaryValue?: number;
  value: number;
  valueLabel?: string;
};

export function MentorImpactCard({
  description,
  emptyMessage,
  label,
  secondaryLabel,
  secondaryValue,
  value,
  valueLabel = "Mães apoiadas",
}: MentorImpactCardProps) {
  const shouldShowEmptyMessage =
    Boolean(emptyMessage) && value === 0 && (secondaryValue === undefined || secondaryValue === 0);

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
        <span className="pb-1 text-base font-semibold text-title">{valueLabel}</span>
      </div>

      <p className="mt-5 text-sm leading-6 text-text">{description}</p>

      {typeof secondaryValue === "number" && secondaryLabel ? (
        <div className="mt-5 rounded-[1.35rem] bg-surface/70 px-4 py-4">
          <p className="font-title text-2xl font-extrabold leading-none text-title">
            {secondaryValue}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-text">
            {secondaryLabel}
          </p>
        </div>
      ) : null}

      {shouldShowEmptyMessage ? (
        <p className="mt-4 rounded-[1.35rem] bg-primary/10 py-4 pl-4 pr-20 text-sm font-semibold leading-6 text-primary md:pr-4">
          {emptyMessage}
        </p>
      ) : null}
    </article>
  );
}

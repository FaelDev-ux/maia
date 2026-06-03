import Link from "next/link";

type HomeSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
};

export function HomeSectionHeader({
  title,
  actionLabel,
  actionHref,
}: HomeSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-title text-[1.35rem] font-extrabold leading-tight text-title">
        {title}
      </h2>

      {actionLabel && actionHref ? (
        <Link
          className="shrink-0 rounded-full px-2 py-1 text-sm font-extrabold text-primary transition hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : actionLabel ? (
        <button
          className="shrink-0 rounded-full px-2 py-1 text-sm font-extrabold text-primary transition hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

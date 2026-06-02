import type { CommunityFilter } from "@/features/community/types";
import cn from "@/lib/utils";

type CommunityFilterChipsProps = {
  filters: CommunityFilter[];
};

export function CommunityFilterChips({ filters }: CommunityFilterChipsProps) {
  return (
    <div
      aria-label="Filtros da comunidade"
      className="-mx-8 flex gap-3 overflow-x-auto px-8 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {filters.map((filter) => (
        <button
          aria-pressed={filter.active ? "true" : "false"}
          className={cn(
            "h-11 shrink-0 rounded-full border border-border bg-white px-5 text-sm font-extrabold text-text shadow-[0_10px_26px_rgb(140_64_84_/_0.07)] transition hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            filter.active && "border-primary/30 bg-primary text-white hover:bg-primary hover:text-white"
          )}
          key={filter.id}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

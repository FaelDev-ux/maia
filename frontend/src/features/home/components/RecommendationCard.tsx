import type { Recommendation } from "@/features/home/types";

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <article className="w-[17.5rem] shrink-0 md:w-full">
      <div
        className="relative h-48 overflow-hidden rounded-[2rem] bg-cover bg-center shadow-card md:h-52"
        style={{ backgroundImage: `url(${recommendation.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-title/26 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-4 rounded-full bg-white/55 px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-md">
          {recommendation.duration}
        </span>
      </div>

      <h3 className="mt-4 font-title text-[1.08rem] font-extrabold leading-tight text-title">
        {recommendation.title}
      </h3>
      <p className="mt-1 text-sm leading-5 text-text">{recommendation.description}</p>
    </article>
  );
}

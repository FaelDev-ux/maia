import Link from "next/link";
import type { HomeProfile, Recommendation } from "@/features/home/types";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";

type RecommendationCardProps = {
  profile: HomeProfile;
  recommendation: Recommendation;
};

export function RecommendationCard({ profile, recommendation }: RecommendationCardProps) {
  return (
    <Link
      className="group w-[17.5rem] shrink-0 rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:w-full"
      href={getProfileScopedHref(`/conteudos/${recommendation.contentId}`, profile)}
    >
      <article>
        <div
          className="relative h-48 overflow-hidden rounded-[2rem] bg-cover bg-center shadow-card transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_42px_rgb(216_116_140_/_0.2)] md:h-52"
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
    </Link>
  );
}

import Link from "next/link";
import type { HomeProfile } from "@/features/home/types";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import type { ContentArticle } from "@/features/contents/types";

type ContentArticleCardProps = {
  article: ContentArticle;
  profile: HomeProfile;
};

export function ContentArticleCard({ article, profile }: ContentArticleCardProps) {
  return (
    <Link
      className="group block rounded-[2rem] bg-white p-4 shadow-[0_16px_44px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      href={getProfileScopedHref(`/conteudos/${article.id}`, profile)}
    >
      <div
        className="relative h-44 overflow-hidden rounded-[1.55rem] bg-cover bg-center md:h-52"
        style={{ backgroundImage: `url(${article.imageUrl})` }}
      >
        <span className="absolute bottom-3 left-3 rounded-full bg-white/60 px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-white shadow-sm backdrop-blur-md">
          {article.readTime.replace(" de leitura", "")}
        </span>
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
        {article.category}
      </p>
      <h2 className="mt-2 font-title text-xl font-extrabold leading-tight text-title transition group-hover:text-primary">
        {article.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text">{article.summary}</p>
    </Link>
  );
}

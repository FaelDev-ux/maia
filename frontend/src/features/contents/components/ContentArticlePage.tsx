import { CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ContentArticleActions } from "@/features/contents/components/ContentArticleActions";
import { ContentHeader } from "@/features/contents/components/ContentHeader";
import type { HomeProfile } from "@/features/home/types";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import type { ContentArticle } from "@/features/contents/types";

type ContentArticlePageProps = {
  article: ContentArticle;
  profile: HomeProfile;
};

function renderHighlightedTitle(article: ContentArticle) {
  if (!article.highlightWord || !article.title.includes(article.highlightWord)) {
    return article.title;
  }

  const [start, end] = article.title.split(article.highlightWord);

  return (
    <>
      {start}
      <span className="text-primary">{article.highlightWord}</span>
      {end}
    </>
  );
}

export function ContentArticlePage({ article, profile }: ContentArticlePageProps) {
  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[64rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <ContentHeader backHref="/conteudos" backLabel="Voltar para conteúdos" profile={profile} />

        <article className="px-8 pb-8 pt-6 md:mx-auto md:max-w-[44rem] md:px-0 md:pt-10">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-tertiary">
              <Clock3 aria-hidden size={14} strokeWidth={2.4} />
              {article.readTime}
            </span>
            {article.badge ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-primary">
                <Sparkles aria-hidden size={14} strokeWidth={2.4} />
                {article.badge}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 font-title text-[2.45rem] font-extrabold leading-[1.08] text-title md:text-6xl">
            {renderHighlightedTitle(article)}
          </h1>

          <div
            aria-label={article.imageAlt}
            className="mt-7 h-[18rem] rounded-[2.3rem] bg-cover bg-center shadow-card md:h-[30rem]"
            role="img"
            style={{ backgroundImage: `url(${article.imageUrl})` }}
          />

          <div className="mt-8 space-y-7 text-[1.08rem] leading-9 text-text md:text-lg md:leading-10">
            {article.sections[0]?.paragraphs?.map((paragraph) => (
              <p className="text-justify" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <blockquote className="mt-8 rounded-[2rem] border-l-4 border-primary bg-primary/8 px-8 py-7 font-title text-xl font-extrabold leading-9 text-primary md:text-2xl md:leading-10">
            &ldquo;{article.quote}&rdquo;
          </blockquote>

          {article.sections.slice(1).map((section, index) => (
            <section className="mt-8" key={`${section.title ?? "section"}-${index}`}>
              {section.title ? (
                <h2 className="font-title text-[2rem] font-extrabold leading-[1.05] text-title md:text-5xl">
                  {section.title}
                </h2>
              ) : null}

              {section.paragraphs?.map((paragraph) => (
                <p
                  className="mt-7 text-justify text-[1.08rem] leading-9 text-text md:text-lg md:leading-10"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}

              {section.items ? (
                <ul className="mt-7 space-y-5">
                  {section.items.map((item) => (
                    <li className="flex gap-4 text-[1.02rem] leading-8 text-text" key={item.title}>
                      <CheckCircle2
                        aria-hidden
                        className="mt-1 shrink-0 text-primary-hover"
                        size={22}
                        strokeWidth={2.4}
                      />
                      <span>
                        <strong className="font-title text-title">{item.title}</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <ContentArticleActions
            articleId={article.id}
            articleTitle={article.title}
            sharePath={getProfileScopedHref(`/conteudos/${article.id}`, profile)}
          />
        </article>
      </div>
      <BottomNavigation profile={profile} />
    </main>
  );
}

import { Bookmark, CheckCircle2, Clock3, Heart, Share2, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ContentHeader } from "@/features/contents/components/ContentHeader";
import type { HomeProfile } from "@/features/home/types";
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

          <section className="mt-10 rounded-[2.5rem] bg-white px-8 py-10 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
            <h2 className="font-title text-2xl font-extrabold text-title">Isso te ajudou?</h2>
            <p className="mx-auto mt-3 max-w-[17rem] text-base leading-6 text-text">
              Sua reação nos ajuda a criar conteúdos mais acolhedores.
            </p>
            <div className="mt-8 grid gap-4 sm:mx-auto sm:max-w-[15rem]">
              <button
                className="flex h-13 items-center justify-center gap-3 rounded-full bg-surface px-6 font-extrabold text-title transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                type="button"
              >
                <ThumbsUp aria-hidden className="text-primary" size={20} strokeWidth={2.2} />
                Sim
              </button>
              <button
                className="flex h-13 items-center justify-center gap-3 rounded-full bg-surface px-6 font-extrabold text-title transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                type="button"
              >
                <ThumbsDown aria-hidden className="text-text/70" size={20} strokeWidth={2.2} />
                Não
              </button>
              <button
                className="flex h-13 items-center justify-center gap-3 rounded-full bg-primary px-6 font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                type="button"
              >
                <Heart aria-hidden className="fill-white" size={20} strokeWidth={0} />
                Amei!
              </button>
            </div>
          </section>

          <footer className="mt-8 flex items-center justify-between border-t border-border pt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-text">
            <button className="flex items-center gap-2 transition hover:text-primary" type="button">
              <Share2 aria-hidden size={18} strokeWidth={2.3} />
              Compartilhar
            </button>
            <button className="flex items-center gap-2 transition hover:text-primary" type="button">
              <Bookmark aria-hidden size={18} strokeWidth={2.3} />
              Salvar
            </button>
          </footer>
        </article>
      </div>
      <BottomNavigation />
    </main>
  );
}

import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ContentArticleCard } from "@/features/contents/components/ContentArticleCard";
import { ContentHeader } from "@/features/contents/components/ContentHeader";
import { contentArticles } from "@/features/contents/data/content-articles";

export function ContentsPage() {
  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <ContentHeader backHref="/home" backLabel="Voltar para a home" />

        <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
          <section aria-labelledby="contents-title">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              Biblioteca Maia
            </p>
            <h1
              className="mt-5 max-w-[22rem] font-title text-[2.12rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
              id="contents-title"
            >
              Conteúdos para cuidar de <span className="text-primary">você.</span>
            </h1>
            <p className="mt-6 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
              Leituras acolhedoras para apoiar sua jornada, com práticas simples e linguagem
              cuidadosa.
            </p>
          </section>

          <section className="mt-8 md:mt-0" aria-label="Artigos recomendados">
            <div className="grid gap-5 md:grid-cols-2">
              {contentArticles.map((article) => (
                <ContentArticleCard article={article} key={article.id} />
              ))}
            </div>
          </section>
        </div>
      </div>
      <BottomNavigation />
    </main>
  );
}

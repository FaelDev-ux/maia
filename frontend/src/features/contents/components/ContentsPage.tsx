"use client";

import { useEffect, useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ContentArticleCard } from "@/features/contents/components/ContentArticleCard";
import { ContentHeader } from "@/features/contents/components/ContentHeader";
import { fetchContents } from "@/features/contents/services";
import type { ContentArticle } from "@/features/contents/types";
import type { HomeProfile } from "@/features/home/types";

type ContentsPageProps = {
  profile: HomeProfile;
};

export function ContentsPage({ profile }: ContentsPageProps) {
  const isHealthProfessional = profile === "health-professional";
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadContents() {
      setIsLoading(true);
      setError("");

      try {
        const nextArticles = await fetchContents();

        if (isMounted) {
          setArticles(nextArticles);
        }
      } catch (currentError) {
        if (isMounted) {
          setError(
            currentError instanceof Error
              ? currentError.message
              : "Nao foi possivel carregar os conteudos."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadContents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <ContentHeader backHref="/home" backLabel="Voltar para a home" profile={profile} />

        <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
          <section aria-labelledby="contents-title">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              {isHealthProfessional ? "Referências Maia" : "Biblioteca Maia"}
            </p>
            <h1
              className="mt-5 max-w-[22rem] font-title text-[2.12rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
              id="contents-title"
            >
              {isHealthProfessional ? (
                <>
                  Conteúdos para orientar com <span className="text-primary">cuidado.</span>
                </>
              ) : (
                <>
                  Conteúdos para cuidar de <span className="text-primary">você.</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
              {isHealthProfessional
                ? "Use estas leituras como apoio para publicar orientações gerais, acolhedoras e sem diagnóstico na comunidade."
                : "Leituras acolhedoras para apoiar sua jornada, com práticas simples e linguagem cuidadosa."}
            </p>
          </section>

          <section className="mt-8 md:mt-0" aria-label="Artigos recomendados">
            {isLoading ? (
              <div className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
                <p className="font-title text-xl font-extrabold text-title">
                  Carregando conteudos
                </p>
                <p className="mt-3 text-sm leading-6 text-text">
                  Estamos buscando as leituras disponiveis para voce.
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[2rem] bg-primary/10 px-6 py-6 text-sm font-bold leading-6 text-primary">
                {error}
              </div>
            ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {articles.map((article) => (
                <ContentArticleCard article={article} key={article.id} profile={profile} />
              ))}
            </div>
            )}
          </section>
        </div>
      </div>
      <BottomNavigation profile={profile} />
    </main>
  );
}

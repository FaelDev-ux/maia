"use client";

import { useEffect, useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ContentArticleCard } from "@/features/contents/components/ContentArticleCard";
import { ContentHeader } from "@/features/contents/components/ContentHeader";
import { createContent, fetchContents, updateContentStatus } from "@/features/contents/services";
import type { ContentArticle } from "@/features/contents/types";
import type { HomeProfile } from "@/features/home/types";
import { useStoredUserProfile } from "@/features/profile/hooks/useStoredProfileValues";

type ContentsPageProps = {
  profile: HomeProfile;
};

export function ContentsPage({ profile }: ContentsPageProps) {
  const isHealthProfessional = profile === "health-professional";
  const user = useStoredUserProfile(profile);
  const canManageContents = isHealthProfessional || user.roles.includes("ADM");
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

  async function reloadContents() {
    setArticles(await fetchContents());
  }

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
            {canManageContents ? (
              <ContentManagerPanel
                articles={articles}
                isAdmin={user.roles.includes("ADM")}
                onChanged={reloadContents}
              />
            ) : null}

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

function ContentManagerPanel({
  articles,
  isAdmin,
  onChanged,
}: {
  articles: ContentArticle[];
  isAdmin: boolean;
  onChanged: () => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Bem-estar");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await createContent({
        body,
        category,
        readingTimeMinutes: 6,
        status: isAdmin ? "published" : undefined,
        summary,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        title,
      });
      setBody("");
      setSummary("");
      setTags("");
      setTitle("");
      await onChanged();
      setMessage(isAdmin ? "Conteudo publicado." : "Conteudo enviado para revisao.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel criar conteudo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatus(contentId: string, status: "archived" | "published") {
    setMessage("");

    try {
      await updateContentStatus(contentId, status);
      await onChanged();
      setMessage(status === "published" ? "Conteudo publicado." : "Conteudo arquivado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel atualizar conteudo.");
    }
  }

  return (
    <div className="mb-6 rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
      <h2 className="font-title text-lg font-extrabold text-title">Gestao de conteudos</h2>
      <p className="mt-2 text-sm leading-6 text-text">
        Profissionais enviam para revisao. Administradores podem publicar ou arquivar.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
        <input
          className="h-12 rounded-full border border-border bg-background px-4 text-sm font-semibold text-title outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titulo"
          required
          value={title}
        />
        <input
          className="h-12 rounded-full border border-border bg-background px-4 text-sm font-semibold text-title outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Resumo"
          required
          value={summary}
        />
        <input
          className="h-12 rounded-full border border-border bg-background px-4 text-sm font-semibold text-title outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Categoria"
          value={category}
        />
        <input
          className="h-12 rounded-full border border-border bg-background px-4 text-sm font-semibold text-title outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          onChange={(event) => setTags(event.target.value)}
          placeholder="Tags separadas por virgula"
          value={tags}
        />
        <textarea
          className="min-h-28 rounded-[1.35rem] border border-border bg-background px-4 py-3 text-sm font-semibold leading-6 text-title outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Corpo do conteudo"
          required
          value={body}
        />
        <button
          className="h-12 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando..." : isAdmin ? "Publicar conteudo" : "Enviar para revisao"}
        </button>
      </form>

      {message ? <p className="mt-3 text-sm font-bold text-primary">{message}</p> : null}

      {isAdmin ? (
        <div className="mt-5 grid gap-3">
          {articles
            .filter((article) => article.status && article.status !== "published")
            .map((article) => (
              <div
                className="rounded-[1.25rem] bg-background px-4 py-3 ring-1 ring-border/65"
                key={article.id}
              >
                <p className="font-title text-sm font-extrabold text-title">{article.title}</p>
                <p className="mt-1 text-xs font-bold text-text">Status: {article.status}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="h-10 rounded-full bg-primary px-4 text-xs font-extrabold text-white"
                    onClick={() => void handleStatus(article.id, "published")}
                    type="button"
                  >
                    Publicar
                  </button>
                  <button
                    className="h-10 rounded-full bg-surface px-4 text-xs font-extrabold text-title"
                    onClick={() => void handleStatus(article.id, "archived")}
                    type="button"
                  >
                    Arquivar
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}

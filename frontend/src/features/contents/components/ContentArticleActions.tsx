"use client";

import { useMemo, useState } from "react";
import { Bookmark, Heart, Share2, ThumbsDown, ThumbsUp } from "lucide-react";

type FeedbackValue = "yes" | "no" | "love";

type ContentArticleActionsProps = {
  articleId: string;
  articleTitle: string;
  sharePath: string;
};

const feedbackMessages: Record<FeedbackValue, string> = {
  yes: "Obrigada pelo retorno. Vamos priorizar conteudos parecidos para apoiar sua jornada.",
  no: "Obrigada por avisar. Esse retorno ajuda a ajustar as recomendacoes com mais cuidado.",
  love: "Que bom que esse conteudo fez sentido para voce.",
};

function getAbsoluteShareUrl(sharePath: string) {
  if (typeof window === "undefined") {
    return sharePath;
  }

  return new URL(sharePath, window.location.origin).toString();
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ContentArticleActions({
  articleId,
  articleTitle,
  sharePath,
}: ContentArticleActionsProps) {
  const [shareStatus, setShareStatus] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackValue | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const isSaved = savedArticleIds.includes(articleId);
  const feedbackOptions = useMemo(
    () =>
      [
        {
          icon: ThumbsUp,
          label: "Sim",
          value: "yes",
        },
        {
          icon: ThumbsDown,
          label: "Nao",
          value: "no",
        },
        {
          icon: Heart,
          label: "Amei!",
          value: "love",
        },
      ] satisfies Array<{
        icon: typeof ThumbsUp;
        label: string;
        value: FeedbackValue;
      }>,
    []
  );

  function handleSaveToggle() {
    setSavedArticleIds((currentIds) =>
      currentIds.includes(articleId)
        ? currentIds.filter((savedArticleId) => savedArticleId !== articleId)
        : [...currentIds, articleId]
    );
  }

  async function handleShare() {
    const shareUrl = getAbsoluteShareUrl(sharePath);
    const shareData = {
      title: articleTitle,
      text: "Encontrei este conteudo no Maia e achei que pode ajudar.",
      url: shareUrl,
    };

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setShareStatus("Compartilhamento aberto.");
        return;
      }

      await copyToClipboard(shareUrl);
      setShareStatus("Link copiado para compartilhar quando quiser.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("");
        return;
      }

      try {
        await copyToClipboard(shareUrl);
        setShareStatus("Link copiado para compartilhar quando quiser.");
      } catch {
        setShareStatus("Nao consegui compartilhar agora. Voce pode copiar o link pela barra do navegador.");
      }
    }
  }

  return (
    <>
      <section className="mt-10 rounded-[2.5rem] bg-white px-8 py-10 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
        <h2 className="font-title text-2xl font-extrabold text-title">Isso te ajudou?</h2>
        <p className="mx-auto mt-3 max-w-[17rem] text-base leading-6 text-text">
          Sua reacao nos ajuda a criar conteudos mais acolhedores.
        </p>
        <div className="mt-8 grid gap-4 sm:mx-auto sm:max-w-[15rem]">
          {feedbackOptions.map(({ icon: Icon, label, value }) => {
            const isSelected = selectedFeedback === value;
            const isLove = value === "love";

            return (
              <button
                aria-pressed={isSelected}
                className={`flex h-13 items-center justify-center gap-3 rounded-full px-6 font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                  isSelected
                    ? "bg-primary text-white shadow-button hover:bg-primary/90"
                    : "bg-surface text-title hover:bg-primary/10"
                }`}
                key={value}
                onClick={() => setSelectedFeedback(value)}
                type="button"
              >
                <Icon
                  aria-hidden
                  className={isSelected ? "text-white" : "text-primary"}
                  fill={value === "love" && (isSelected || isLove) ? "currentColor" : "none"}
                  size={20}
                  strokeWidth={value === "love" && (isSelected || isLove) ? 0 : 2.2}
                />
                {label}
              </button>
            );
          })}
        </div>
        {selectedFeedback ? (
          <p
            aria-live="polite"
            className="mx-auto mt-6 max-w-[18rem] rounded-[1.5rem] bg-primary/8 px-5 py-4 text-sm font-semibold leading-6 text-primary"
          >
            {feedbackMessages[selectedFeedback]}
          </p>
        ) : null}
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-border pt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-text">
        <button
          className="flex items-center gap-2 transition hover:text-primary focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          onClick={handleShare}
          type="button"
        >
          <Share2 aria-hidden size={18} strokeWidth={2.3} />
          Compartilhar
        </button>
        <button
          aria-pressed={isSaved}
          className="flex items-center gap-2 transition hover:text-primary focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          onClick={handleSaveToggle}
          type="button"
        >
          <Bookmark aria-hidden fill={isSaved ? "currentColor" : "none"} size={18} strokeWidth={2.3} />
          {isSaved ? "Salvo" : "Salvar"}
        </button>
        {shareStatus ? (
          <p aria-live="polite" className="basis-full text-[0.7rem] normal-case tracking-normal text-primary">
            {shareStatus}
          </p>
        ) : null}
      </footer>
    </>
  );
}

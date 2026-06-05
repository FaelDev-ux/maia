"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Bookmark, Heart, Share2, ThumbsDown, ThumbsUp } from "lucide-react";

const CONTENT_FEEDBACK_STORAGE_KEY = "maia-content-feedback";
const SAVED_CONTENTS_STORAGE_KEY = "maia-saved-contents";
const CONTENT_ACTIONS_UPDATED_EVENT = "maia-content-actions-updated";

type FeedbackValue = "yes" | "no" | "love";
type StoredFeedback = Partial<Record<string, FeedbackValue>>;

type ContentArticleActionsProps = {
  articleId: string;
  articleTitle: string;
  sharePath: string;
};

const feedbackMessages: Record<FeedbackValue, string> = {
  yes: "Obrigada pelo retorno. Vamos priorizar conteúdos parecidos para apoiar sua jornada.",
  no: "Obrigada por avisar. Esse retorno ajuda a ajustar as recomendações com mais cuidado.",
  love: "Que bom que esse conteúdo fez sentido para você. Ele ficará marcado como especial por aqui.",
};

function readJsonValue<T>(storageKey: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    window.localStorage.removeItem(storageKey);
    return fallback;
  }
}

function parseJsonSnapshot<T>(snapshot: string, fallback: T): T {
  try {
    return snapshot ? (JSON.parse(snapshot) as T) : fallback;
  } catch {
    return fallback;
  }
}

function subscribeToContentActions(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CONTENT_ACTIONS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CONTENT_ACTIONS_UPDATED_EVENT, onStoreChange);
  };
}

function getFeedbackSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(CONTENT_FEEDBACK_STORAGE_KEY) ?? "";
}

function getSavedContentsSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SAVED_CONTENTS_STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

function notifyContentActionsUpdated() {
  window.dispatchEvent(new Event(CONTENT_ACTIONS_UPDATED_EVENT));
}

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

export function ContentArticleActions({ articleId, articleTitle, sharePath }: ContentArticleActionsProps) {
  const [shareStatus, setShareStatus] = useState("");
  const feedbackSnapshot = useSyncExternalStore(
    subscribeToContentActions,
    getFeedbackSnapshot,
    getServerSnapshot,
  );
  const savedContentsSnapshot = useSyncExternalStore(
    subscribeToContentActions,
    getSavedContentsSnapshot,
    getServerSnapshot,
  );

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
          label: "Não",
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
    [],
  );

  const storedFeedback = useMemo(
    () => parseJsonSnapshot<StoredFeedback>(feedbackSnapshot, {}),
    [feedbackSnapshot],
  );
  const savedContents = useMemo(
    () => parseJsonSnapshot<string[]>(savedContentsSnapshot, []),
    [savedContentsSnapshot],
  );
  const selectedFeedback = storedFeedback[articleId] ?? null;
  const isSaved = savedContents.includes(articleId);

  function handleFeedback(value: FeedbackValue) {
    const storedFeedback = readJsonValue<StoredFeedback>(CONTENT_FEEDBACK_STORAGE_KEY, {});
    const nextFeedback = {
      ...storedFeedback,
      [articleId]: value,
    };

    window.localStorage.setItem(CONTENT_FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback));
    notifyContentActionsUpdated();
  }

  function handleSaveToggle() {
    const currentSavedContents = readJsonValue<string[]>(SAVED_CONTENTS_STORAGE_KEY, []);
    const nextSavedContents = isSaved
      ? currentSavedContents.filter((savedArticleId) => savedArticleId !== articleId)
      : [...new Set([...currentSavedContents, articleId])];

    window.localStorage.setItem(SAVED_CONTENTS_STORAGE_KEY, JSON.stringify(nextSavedContents));
    notifyContentActionsUpdated();
  }

  async function handleShare() {
    const shareUrl = getAbsoluteShareUrl(sharePath);
    const shareData = {
      title: articleTitle,
      text: "Encontrei este conteúdo no Maia e achei que pode ajudar.",
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
        setShareStatus("Não consegui compartilhar agora. Você pode copiar o link pela barra do navegador.");
      }
    }
  }

  return (
    <>
      <section className="mt-10 rounded-[2.5rem] bg-white px-8 py-10 text-center shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65">
        <h2 className="font-title text-2xl font-extrabold text-title">Isso te ajudou?</h2>
        <p className="mx-auto mt-3 max-w-[17rem] text-base leading-6 text-text">
          Sua reação nos ajuda a criar conteúdos mais acolhedores.
        </p>
        <div className="mt-8 grid gap-4 sm:mx-auto sm:max-w-[15rem]">
          {feedbackOptions.map(({ icon: Icon, label, value }) => {
            const isSelected = selectedFeedback === value;
            const isLove = value === "love";

            return (
              <button
                aria-pressed={isSelected}
                className={`flex h-13 items-center justify-center gap-3 rounded-full px-6 font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                  isSelected || isLove
                    ? "bg-primary text-white shadow-button hover:bg-primary/90"
                    : "bg-surface text-title hover:bg-primary/10"
                }`}
                key={value}
                onClick={() => handleFeedback(value)}
                type="button"
              >
                <Icon
                  aria-hidden
                  className={isSelected || isLove ? "text-white" : "text-primary"}
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

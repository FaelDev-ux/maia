import { type FormEvent, useEffect, useId, useState } from "react";
import { EyeOff, MessageSquareText, Send, X } from "lucide-react";
import type { CommunityPost, CommunityPostCategory } from "@/features/community/types";

type CommunityCreatePostModalProps = {
  authorInitials: string;
  authorName: string;
  authorRole: string;
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (post: CommunityPost) => void;
};

type CommunityPostCategoryOption = {
  value: CommunityPostCategory;
  label: string;
  helper: string;
};

const categoryOptions: CommunityPostCategoryOption[] = [
  {
    value: "apoio",
    label: "Preciso de apoio",
    helper: "Para pedir acolhimento ou companhia.",
  },
  {
    value: "sono",
    label: "Sono e rotina",
    helper: "Para falar de descanso, noites e rotina.",
  },
  {
    value: "rede",
    label: "Rede de apoio",
    helper: "Para dividir pedidos de ajuda e organização.",
  },
  {
    value: "profissional",
    label: "Orientação cuidadosa",
    helper: "Para dúvidas que podem receber apoio verificado.",
  },
];

const categoryLabels = categoryOptions.reduce(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {} as Record<CommunityPostCategory, string>,
);

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 4);
}

export function CommunityCreatePostModal({
  authorInitials,
  authorName,
  authorRole,
  isOpen,
  onClose,
  onCreatePost,
}: CommunityCreatePostModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("apoio");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const titleError = title.trim().length < 6 ? "Escreva um título com pelo menos 6 caracteres." : "";
  const messageError =
    message.trim().length < 20 ? "Conte um pouco mais, com pelo menos 20 caracteres." : "";
  const canSubmit = !titleError && !messageError;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (!canSubmit) {
      return;
    }

    onCreatePost({
      id: `mock-post-${Date.now()}`,
      authorName,
      authorRole: isAnonymous ? "Publicação protegida" : authorRole,
      avatarInitials: isAnonymous ? "IP" : authorInitials,
      timeAgo: "agora",
      category,
      categoryLabel: categoryLabels[category],
      title: title.trim(),
      message: message.trim(),
      tags: parseTags(tags),
      supportCount: 0,
      repliesCount: 0,
      isAnonymous,
    });

    setTitle("");
    setMessage("");
    setCategory("apoio");
    setTags("");
    setIsAnonymous(false);
    setHasSubmitted(false);
    onClose();
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-title/35 px-4 pb-4 pt-12 backdrop-blur-sm md:items-center md:p-8"
      role="dialog"
    >
      <div className="w-full max-w-[31rem] overflow-hidden rounded-[2rem] bg-background shadow-[0_28px_80px_rgb(57_55_56_/_0.24)] ring-1 ring-white/80">
        <form className="flex max-h-[calc(100dvh-2rem)] flex-col" onSubmit={handleSubmit}>
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/70 bg-background/95 px-6 py-5 backdrop-blur md:px-7">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <MessageSquareText aria-hidden size={21} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                  Nova publicação
                </p>
                <h2
                  className="mt-2 font-title text-xl font-extrabold leading-tight text-title"
                  id={titleId}
                >
                  Compartilhar na comunidade
                </h2>
              </div>
            </div>

            <button
              aria-label="Fechar modal"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-text shadow-[0_8px_22px_rgb(140_64_84_/_0.09)] ring-1 ring-border/70 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden size={20} strokeWidth={2.4} />
            </button>
          </header>

          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 [scrollbar-color:rgb(244_139_164_/_0.38)_transparent] [scrollbar-width:thin] md:px-7 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-track]:bg-transparent">
            <label className="block">
              <span className="text-sm font-extrabold text-title">Título</span>
              <input
                className="mt-2 h-13 w-full rounded-[1.25rem] border border-border bg-white px-4 text-base text-title shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                maxLength={90}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="O que você quer compartilhar?"
                value={title}
              />
              {hasSubmitted && titleError ? (
                <span className="mt-2 block text-xs font-semibold text-danger">{titleError}</span>
              ) : null}
            </label>

            <fieldset>
              <legend className="text-sm font-extrabold text-title">Tema</legend>
              <div className="mt-3 grid gap-3">
                {categoryOptions.map((option) => (
                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] bg-white px-4 py-3 shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] ring-1 ring-border/70 transition has-[:checked]:bg-primary/10 has-[:checked]:ring-primary/40"
                    key={option.value}
                  >
                    <input
                      checked={category === option.value}
                      className="peer sr-only"
                      name="community-category"
                      onChange={() => setCategory(option.value)}
                      type="radio"
                    />
                    <span
                      aria-hidden
                      className="relative mt-1 size-4 shrink-0 rounded-full border-2 border-border bg-white transition after:absolute after:left-1/2 after:top-1/2 after:size-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-primary after:opacity-0 after:transition peer-checked:border-primary peer-checked:after:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
                    />
                    <span>
                      <span className="block text-sm font-extrabold text-title">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-text">{option.helper}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-extrabold text-title">Mensagem</span>
              <textarea
                className="mt-2 min-h-36 w-full resize-none rounded-[1.35rem] border border-border bg-white px-4 py-4 text-base leading-7 text-title shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                maxLength={520}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escreva com calma. Você pode pedir apoio, dividir uma experiência ou abrir uma conversa."
                value={message}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                {hasSubmitted && messageError ? (
                  <span className="text-xs font-semibold text-danger">{messageError}</span>
                ) : (
                  <span className="text-xs font-semibold text-text/70">Sem linguagem diagnóstica.</span>
                )}
                <span className="shrink-0 text-xs font-semibold text-text/60">
                  {message.length}/520
                </span>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-extrabold text-title">Tags</span>
              <input
                className="mt-2 h-13 w-full rounded-[1.25rem] border border-border bg-white px-4 text-base text-title shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                onChange={(event) => setTags(event.target.value)}
                placeholder="sono, apoio, rotina"
                value={tags}
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-[1.35rem] bg-white px-4 py-4 shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] ring-1 ring-border/70">
              <input
                checked={isAnonymous}
                className="mt-1 size-4 accent-primary"
                onChange={(event) => setIsAnonymous(event.target.checked)}
                type="checkbox"
              />
              <span className="flex min-w-0 gap-3">
                <EyeOff aria-hidden className="mt-0.5 shrink-0 text-primary" size={18} />
                <span>
                  <span className="block text-sm font-extrabold text-title">
                    Preservar minha identidade
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-text">
                    O post aparecerá como identidade protegida no mural.
                  </span>
                </span>
              </span>
            </label>
          </div>

          <footer className="flex shrink-0 gap-3 border-t border-border/70 bg-background/95 px-6 py-5 backdrop-blur md:px-7">
            <button
              className="h-13 flex-1 rounded-full bg-white px-5 text-sm font-extrabold text-text shadow-[0_8px_22px_rgb(140_64_84_/_0.07)] ring-1 ring-border transition hover:bg-surface/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
              disabled={hasSubmitted && !canSubmit}
              type="submit"
            >
              <Send aria-hidden size={17} strokeWidth={2.3} />
              Publicar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

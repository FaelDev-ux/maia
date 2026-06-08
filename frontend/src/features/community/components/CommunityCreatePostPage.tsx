"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  EyeOff,
  HeartHandshake,
  Moon,
  Send,
  Stethoscope,
  Tags,
  type LucideIcon,
  Users,
} from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import {
  getCommunityAuthorRole,
  getCommunityComposerCopy,
} from "@/features/community/data/community-composer";
import {
  getStoredCreatedCommunityPosts,
  saveStoredCreatedCommunityPosts,
} from "@/features/community/data/community-storage";
import type { CommunityPost, CommunityPostCategory } from "@/features/community/types";
import type { HomeProfile } from "@/features/home/types";
import {
  useStoredProfileValues,
  useStoredUserProfile,
} from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import cn from "@/lib/utils";

type CommunityCreatePostPageProps = {
  profile: HomeProfile;
};

type CategoryOption = {
  details: string;
  icon: LucideIcon;
  label: string;
  value: CommunityPostCategory;
};

const categoryOptions: CategoryOption[] = [
  {
    value: "apoio",
    label: "Preciso de apoio",
    details:
      "Use este tema quando quiser acolhimento, companhia ou uma conversa cuidadosa sobre um momento difícil.",
    icon: HeartHandshake,
  },
  {
    value: "sono",
    label: "Sono e rotina",
    details:
      "Para falar sobre descanso, noites interrompidas, cansaço e pequenos combinados da rotina.",
    icon: Moon,
  },
  {
    value: "rede",
    label: "Rede de apoio",
    details:
      "Para dividir ideias de ajuda, organizar pedidos para família e conversar sobre apoio do dia a dia.",
    icon: Users,
  },
  {
    value: "profissional",
    label: "Orientação cuidadosa",
    details:
      "Para orientações gerais e seguras de profissionais, sem diagnósticos ou substituição de atendimento individual.",
    icon: Stethoscope,
  },
];

const categoryLabels = categoryOptions.reduce(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {} as Record<CommunityPostCategory, string>
);

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 4);
}

function getTitleError(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "O título é obrigatório.";
  }

  if (trimmedValue.length < 6) {
    return "Escreva um título com pelo menos 6 caracteres.";
  }

  return "";
}

function getMessageError(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "A mensagem é obrigatória.";
  }

  if (trimmedValue.length < 20) {
    return "Conte um pouco mais, com pelo menos 20 caracteres.";
  }

  return "";
}

function focusInvalidField(field: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!field) {
    return;
  }

  window.requestAnimationFrame(() => {
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    field.focus({ preventScroll: true });
  });
}

export function CommunityCreatePostPage({ profile }: CommunityCreatePostPageProps) {
  const router = useRouter();
  const storedProfile = useStoredProfileValues(profile);
  const storedUser = useStoredUserProfile(profile);
  const composerCopy = getCommunityComposerCopy(profile);
  const authorRole = getCommunityAuthorRole(profile, storedUser.professionalVerificationStatus);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>(composerCopy.defaultCategory);
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const titleError = getTitleError(title);
  const messageError = getMessageError(message);
  const shouldShowTitleError = hasSubmitted && Boolean(titleError);
  const shouldShowMessageError = hasSubmitted && Boolean(messageError);
  const selectedCategory =
    categoryOptions.find((option) => option.value === category) ?? categoryOptions[0];
  const SelectedCategoryIcon = selectedCategory.icon;
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = storedProfile.avatarUrl;
  const authorInitials = storedProfile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (titleError) {
      focusInvalidField(titleInputRef.current);
      return;
    }

    if (messageError) {
      focusInvalidField(messageInputRef.current);
      return;
    }

    const nextPost: CommunityPost = {
      id: `mock-post-${Date.now()}`,
      authorName: storedProfile.fullName || "Usuária Maia",
      authorRole: isAnonymous ? "Publicação protegida" : authorRole,
      avatarInitials: isAnonymous ? "IP" : authorInitials || avatarInitial,
      timeAgo: "agora",
      category,
      categoryLabel: categoryLabels[category],
      title: title.trim(),
      message: message.trim(),
      tags: parseTags(tags),
      supportCount: 0,
      repliesCount: 0,
      isAnonymous,
    };
    const storedPosts = getStoredCreatedCommunityPosts();

    saveStoredCreatedCommunityPosts([
      nextPost,
      ...storedPosts.filter((post) => post.id !== nextPost.id),
    ]);
    router.push(getProfileScopedHref("/comunidade", profile));
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[56rem] md:overflow-visible md:px-8 md:pb-32">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-6 md:mt-6 md:h-20 md:rounded-[2rem] md:px-8 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <Link
            aria-label="Voltar para comunidade"
            className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href={getProfileScopedHref("/comunidade", profile)}
          >
            <ArrowLeft aria-hidden size={21} strokeWidth={2.4} />
          </Link>

          <MaiaBrand imageClassName="size-13" imageSize={54} textClassName="text-2xl" />

          <Link
            aria-label={`Perfil de ${firstName}`}
            className="grid size-11 place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-base font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            href={getProfileScopedHref("/perfil", profile)}
            title={`Perfil de ${firstName}`}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {avatarUrl ? null : avatarInitial}
          </Link>
        </header>

        <div className="px-6 pb-8 pt-7 md:px-0 md:pt-9">
          <section aria-labelledby="new-community-post-title">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              {composerCopy.pageEyebrow}
            </p>
            <h1
              className="mt-5 max-w-[22rem] font-title text-[2.25rem] font-extrabold leading-[1.08] text-title md:max-w-[32rem] md:text-[3rem]"
              id="new-community-post-title"
            >
              Compartilhar na <span className="text-primary">comunidade</span>
            </h1>
            <p className="mt-5 max-w-[22rem] text-base leading-7 text-text md:max-w-[32rem] md:text-lg md:leading-8">
              Escolha um tema, escreva com calma e publique quando sentir que está pronto.
            </p>
          </section>

          <form
            className="mt-7 rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:px-7"
            noValidate
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="text-sm font-extrabold text-title">
                Título <span className="text-danger">*</span>
              </span>
              <input
                aria-describedby={shouldShowTitleError ? "community-post-title-error" : undefined}
                aria-invalid={shouldShowTitleError}
                className={cn(
                  "mt-2 h-13 w-full rounded-[1.25rem] border bg-background px-4 text-base text-title shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] outline-none transition placeholder:text-text/45 focus:ring-4",
                  shouldShowTitleError
                    ? "border-danger bg-danger/[0.04] focus:border-danger focus:ring-danger/15"
                    : "border-border focus:border-primary focus:ring-primary/15"
                )}
                maxLength={90}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={composerCopy.titlePlaceholder}
                ref={titleInputRef}
                value={title}
              />
              {shouldShowTitleError ? (
                <span
                  className="mt-2 block text-xs font-semibold text-danger"
                  id="community-post-title-error"
                >
                  {titleError}
                </span>
              ) : null}
            </label>

            <fieldset className="mt-6">
              <legend className="text-sm font-extrabold text-title">Tema</legend>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {categoryOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = category === option.value;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className="group flex min-w-0 flex-col items-center rounded-[1.35rem] px-2 py-2 text-center transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      key={option.value}
                      onClick={() => setCategory(option.value)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "grid size-16 place-items-center rounded-full bg-background text-primary ring-1 ring-border transition group-hover:bg-primary/10",
                          isSelected &&
                            "bg-primary text-white ring-primary shadow-[0_12px_26px_rgb(216_116_140_/_0.24)] group-hover:bg-primary group-hover:text-white"
                        )}
                      >
                        <Icon aria-hidden size={25} strokeWidth={2.3} />
                      </span>
                      <span
                        className={cn(
                          "mt-2 text-xs font-extrabold leading-4 text-text",
                          isSelected && "text-title"
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[1.45rem] bg-primary/[0.08] px-4 py-4 ring-1 ring-primary/15">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-primary">
                    <SelectedCategoryIcon aria-hidden size={18} strokeWidth={2.3} />
                  </span>
                  <div>
                    <p className="font-title text-sm font-extrabold text-title">
                      {selectedCategory.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text">{selectedCategory.details}</p>
                  </div>
                </div>
              </div>
            </fieldset>

            <label className="mt-6 block">
              <span className="text-sm font-extrabold text-title">
                Mensagem <span className="text-danger">*</span>
              </span>
              <textarea
                aria-describedby={
                  shouldShowMessageError ? "community-post-message-error" : undefined
                }
                aria-invalid={shouldShowMessageError}
                className={cn(
                  "mt-2 min-h-40 w-full resize-none rounded-[1.35rem] border bg-background px-4 py-4 text-base leading-7 text-title shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] outline-none transition placeholder:text-text/45 focus:ring-4",
                  shouldShowMessageError
                    ? "border-danger bg-danger/[0.04] focus:border-danger focus:ring-danger/15"
                    : "border-border focus:border-primary focus:ring-primary/15"
                )}
                maxLength={520}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={composerCopy.messagePlaceholder}
                ref={messageInputRef}
                value={message}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                {shouldShowMessageError ? (
                  <span
                    className="text-xs font-semibold text-danger"
                    id="community-post-message-error"
                  >
                    {messageError}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-text/70">
                    Evite diagnósticos e preserve informações sensíveis.
                  </span>
                )}
                <span className="shrink-0 text-xs font-semibold text-text/60">
                  {message.length}/520
                </span>
              </div>
            </label>

            <label className="mt-6 block">
              <span className="inline-flex items-center gap-2 text-sm font-extrabold text-title">
                <Tags aria-hidden className="text-primary" size={16} strokeWidth={2.3} />
                Tags
              </span>
              <input
                className="mt-2 h-13 w-full rounded-[1.25rem] border border-border bg-background px-4 text-base text-title shadow-[0_8px_22px_rgb(140_64_84_/_0.06)] outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                onChange={(event) => setTags(event.target.value)}
                placeholder="sono, apoio, rotina"
                value={tags}
              />
              <span className="mt-2 block text-xs font-semibold text-text/65">
                Separe por vírgulas. Vamos usar no máximo 4 tags.
              </span>
            </label>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[1.35rem] bg-background px-4 py-4 ring-1 ring-border/70">
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

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-full bg-background px-5 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href={getProfileScopedHref("/comunidade", profile)}
              >
                Cancelar
              </Link>
              <button
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                type="submit"
              >
                <Send aria-hidden size={17} strokeWidth={2.3} />
                {composerCopy.submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>

      <BottomNavigation profile={profile} />
    </main>
  );
}

import { PenLine } from "lucide-react";

type CommunityComposerCardProps = {
  onCreatePost: () => void;
};

export function CommunityComposerCard({ onCreatePost }: CommunityComposerCardProps) {
  return (
    <section
      aria-labelledby="community-composer-title"
      className="rounded-[2.15rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.12)] ring-1 ring-border/65 md:px-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <PenLine aria-hidden size={20} strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
            Compartilhe com cuidado
          </p>
          <h2
            className="mt-2 font-title text-xl font-extrabold leading-tight text-title"
            id="community-composer-title"
          >
            Como podemos te apoiar hoje?
          </h2>
          <p className="mt-3 text-sm leading-6 text-text">
            Publique uma dúvida, pedido de apoio ou experiência. Você pode preservar sua identidade
            quando preferir.
          </p>
        </div>
      </div>

      <button
        className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        onClick={onCreatePost}
        type="button"
      >
        Criar publicação
      </button>
    </section>
  );
}

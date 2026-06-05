import Image from "next/image";
import { ArrowUp } from "lucide-react";
import type { PointerEventHandler } from "react";

type SignupIntroCoverProps = {
  isDragging: boolean;
  isRevealed: boolean;
  onPointerCancel: PointerEventHandler<HTMLElement>;
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  translateY: number;
};

export function SignupIntroCover({
  isDragging,
  isRevealed,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  translateY,
}: SignupIntroCoverProps) {
  return (
    <section
      aria-hidden={isRevealed}
      className={`absolute inset-0 z-10 flex touch-none select-none flex-col items-center justify-center overflow-hidden px-8 py-10 text-white transition-transform duration-500 ease-out ${
        isRevealed ? "pointer-events-none" : ""
      } ${isDragging ? "" : "maia-swipe-cover-peek"}`}
      onPointerCancel={onPointerCancel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        background: "linear-gradient(155deg, #f97f9f 0%, #ee7ea8 48%, #cf79c6 100%)",
        transform: `translateY(${translateY}px)`,
        transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="relative mb-9 size-48 sm:size-56">
          <div className="absolute inset-5 rounded-full bg-primary-hover/20 blur-xl" />
          <Image
            alt="Maia"
            className="relative object-contain drop-shadow-[0_18px_24px_rgba(140,64,84,0.28)]"
            priority
            height={400}
            width={400}
            src="/images/logo-maia.png"
          />
        </div>

        <h1 className="font-title text-5xl font-extrabold leading-none text-neutral! sm:text-6xl">
          Maia
        </h1>

        <div className="mt-6 h-px w-22 bg-white/80" />

        <p className="mt-4 max-w-70 text-center text-lg leading-8 tracking-wide text-neutral sm:text-xl">
          onde seus sentimentos encontram acolhimento
        </p>

        <div className="maia-swipe-hint mt-14 flex flex-col items-center gap-2" aria-hidden="true">
          <ArrowUp className="maia-swipe-arrow text-white drop-shadow-[0_10px_18px_rgb(140_64_84_/_0.22)]" size={34} strokeWidth={2.7} />
          <span className="h-8 w-px rounded-full bg-gradient-to-b from-white/85 to-white/10" />
        </div>

        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.34em] text-white/90">
          Arraste para cima
        </p>
      </div>
    </section>
  );
}

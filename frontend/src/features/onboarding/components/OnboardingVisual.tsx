import Image from "next/image";
import { Heart } from "lucide-react";
import type { OnboardingSlide } from "../types";

type OnboardingVisualProps = {
  slide: OnboardingSlide;
  priority?: boolean;
};

export function OnboardingVisual({ slide, priority = false }: OnboardingVisualProps) {
  return (
    <section
      aria-label={slide.imageAlt}
      className="relative mx-auto w-full max-w-md lg:max-w-124"
    >
      <div className="relative h-[clamp(19rem,48dvh,28rem)] overflow-hidden rounded-maia-xl shadow-card sm:h-[clamp(23rem,52dvh,31rem)] lg:h-[min(68dvh,35rem)]">
        <div className="maia-slide-visual absolute inset-0" key={slide.imageSrc}>
          <Image
            alt={slide.imageAlt}
            className="object-cover object-center"
            fill
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 448px, 496px"
            src={slide.imageSrc}
          />
        </div>
      </div>

      <div className="absolute -right-1 -bottom-5 z-10 flex min-w-46 items-center gap-3 rounded-full border border-white/40 bg-white/40 px-4 py-3 shadow-soft backdrop-blur-sm sm:-right-6 sm:-bottom-6">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary">
          <Heart size="20" className="text-white" />
        </div>

        <div className="maia-slide-badge min-w-0 leading-none" key={slide.kicker}>
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide font-poppins text-white">
            {slide.kicker}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary-hover">
            {slide.label}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-primary-hover">
            {slide.status}
          </p>
        </div>
      </div>
    </section>
  );
}
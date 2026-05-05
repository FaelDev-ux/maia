"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { onboardingSlides } from "../data/onboarding-slides";
import { OnboardingVisual } from "./OnboardingVisual";
import { SlideIndicators } from "./SlideIndicators";

export function OnboardingPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = onboardingSlides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === onboardingSlides.length - 1;

  const primaryActionLabel = useMemo(() => {
    return isLastSlide ? "Começar agora" : "Próximo";
  }, [isLastSlide]);

  function showNextSlide() {
    setCurrentSlideIndex((slideIndex) => Math.min(slideIndex + 1, onboardingSlides.length - 1));
  }

  function skipToLastSlide() {
    setCurrentSlideIndex(onboardingSlides.length - 1);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-text">
      <div className="pointer-events-none absolute -right-24 top-8 size-80 rounded-full bg-white/70 blur-2xl" />
      <div className="pointer-events-none absolute -left-28 bottom-10 size-80 rounded-full bg-neutral/70 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-[18%] top-0 h-full w-8 rotate-12 bg-white/60 blur-md" />
        <div className="absolute right-4 top-20 h-28 w-11 rotate-30 rounded-full border border-white/90" />
        <div className="absolute bottom-18 right-0 size-18 rounded-full border-18 border-white/75" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-7 pt-4 sm:px-8 lg:px-10 lg:pb-10">
        <header className="flex items-start justify-between">
          <Image
            alt="Maia"
            className="size-14 object-contain sm:size-16"
            height={64}
            priority
            src="/images/logo-maia.png"
            width={64}
          />

          {!isLastSlide && (
            <button
              className="pt-5 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:text-title focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              onClick={skipToLastSlide}
              type="button"
            >
              Pular
            </button>
          )}
        </header>

        <main className="grid flex-1 items-center gap-8 py-5 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-8">
          <div className="order-2 flex flex-col items-center lg:order-1">
            <div className="maia-slide-copy w-full md:w-auto lg:w-full" key={currentSlide.title}>
              <p className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-hover">
                {currentSlide.label}
              </p>

              <h1 className="max-w-88 font-title text-[clamp(2.35rem,11vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-title sm:max-w-124 lg:max-w-136">
                {currentSlide.title}{" "}
                <span className="text-primary">{currentSlide.titleAccent}</span>
              </h1>

              <p className="mt-5 max-w-84 text-base leading-7 text-text sm:max-w-116 sm:text-lg">
                {currentSlide.paragraph}
              </p>
            </div>

            <div className="mt-7 w-full max-w-84 sm:max-w-116">
              <SlideIndicators
                activeIndex={currentSlideIndex}
                onChange={setCurrentSlideIndex}
                total={onboardingSlides.length}
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <OnboardingVisual priority={currentSlideIndex === 0} slide={currentSlide} />
          </div>
        </main>

        <footer className="flex flex-col items-center gap-4 lg:items-start">
          {isLastSlide ? (
            <Link
              className="flex h-14 w-full max-w-84 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white! shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
              href="/cadastro"
            >
              {primaryActionLabel}
            </Link>
          ) : (
            <button
              className="flex h-14 w-full max-w-84 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
              onClick={showNextSlide}
              type="button"
            >
              {primaryActionLabel}
            </button>
          )}

          {isLastSlide && (
            <Link
              className="text-sm font-semibold text-text transition-colors hover:text-title focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              href="/login"
            >
              Já tenho uma conta
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
}
"use client";

import { ArrowRight, Heart } from "lucide-react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";

type HealthProfessionalWelcomeStepProps = {
  onBack: () => void;
};

export function HealthProfessionalWelcomeStep({ onBack }: HealthProfessionalWelcomeStepProps) {
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col px-6 pb-7 pt-6 md:max-w-[56rem] md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-84 sm:max-w-96 md:max-w-[32rem]">
          <HeaderOnboarding currentStep={3} totalSteps={3} onBack={onBack} />
        </div>

        <section className="mx-auto flex flex-1 max-w-[34rem] flex-col items-center justify-center text-center">
          <div className="maia-slide-visual relative mb-20 mt-8 grid size-22 place-items-center rounded-full bg-[#fde7ee] shadow-[0_0_76px_28px_rgba(244,139,164,0.48)] md:mb-16 md:mt-10 md:size-28">
            <div className="absolute inset-[-2rem] rounded-full bg-primary/25 blur-3xl" />
            <div className="relative grid size-22 place-items-center rounded-full bg-[#fde7ee] ring-1 ring-white/80 md:size-28">
              <Heart className="fill-primary text-primary md:size-14" size={42} strokeWidth={0} />
            </div>
          </div>

          <h1 className="maia-auth-mobile-copy max-w-80 font-title text-[2.35rem] font-extrabold leading-[0.98] text-title md:max-w-[34rem] md:text-5xl md:leading-[1.02]">
            Bem-vinda{" "}
            <span className="block">
              ao <span className="text-primary">Maia</span>
            </span>
          </h1>

          <p className="maia-auth-mobile-form mt-10 max-w-82 text-lg leading-7 text-text md:mt-8 md:max-w-[30rem] md:text-xl md:leading-8">
            Que lindo saber que você está disposta a compartilhar seus conhecimentos e ajudar outras
            mães
          </p>
        </section>

        <button
          className="mx-auto flex h-14 w-full max-w-84 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
          type="button"
        >
          <span className="font-extrabold">Continuar</span> <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

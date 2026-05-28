"use client";

import { ArrowRight, Heart } from "lucide-react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";

type RecentMotherWelcomeStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function RecentMotherWelcomeStep({ onBack, onContinue }: RecentMotherWelcomeStepProps) {
  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col px-6 pb-7 pt-6 md:max-w-[56rem] md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-84 sm:max-w-96 md:max-w-[32rem]">
          <HeaderOnboarding currentStep={1} totalSteps={3} onBack={onBack} />
        </div>

        <section className="mx-auto flex flex-1 max-w-[34rem] flex-col items-center justify-center text-center">
          <div className="maia-slide-visual relative mb-16 mt-8 grid size-24 place-items-center rounded-full bg-[#fde7ee] shadow-[0_0_72px_22px_rgba(244,139,164,0.5)] md:mb-14 md:mt-10 md:size-28">
            <div className="absolute inset-[-1.75rem] rounded-full bg-primary/25 blur-3xl" />
            <div className="relative grid size-24 place-items-center rounded-full bg-[#fde7ee] ring-1 ring-white/80 md:size-28">
              <Heart className="fill-primary text-primary md:size-14" size={44} strokeWidth={0} />
            </div>
          </div>

          <h1 className="maia-auth-mobile-copy max-w-80 font-title text-[2.25rem] font-extrabold leading-[1.02] text-title md:max-w-[34rem] md:text-5xl">
            Parabéns pela chegada do seu <span className="text-primary">bebê!</span>
          </h1>

          <p className="maia-auth-mobile-form mt-7 max-w-76 text-lg leading-7 text-text md:max-w-[26rem] md:text-xl md:leading-8">
            Informe a data de nascimento para personalizarmos seu conteúdo.
          </p>
        </section>

        <button
          className="mx-auto flex h-14 w-full max-w-84 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
          onClick={onContinue}
          type="button"
        >
          <span className="font-extrabold">Continuar</span> <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

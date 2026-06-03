"use client";

import { ArrowRight } from "lucide-react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import { supportBenefits } from "../data/support-benefits";

type FutureMotherSupportStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function FutureMotherSupportStep({ onBack, onContinue }: FutureMotherSupportStepProps) {
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col px-6 pb-7 pt-6 md:max-w-[64rem] md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-84 sm:max-w-96 md:max-w-[32rem]">
          <HeaderOnboarding currentStep={3} totalSteps={3} onBack={onBack} />
        </div>

        <div className="mx-auto flex w-full flex-1 flex-col justify-center gap-10 py-10 md:grid md:max-w-[58rem] md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,26rem)] md:items-center md:gap-14 md:py-8">
          <section className="maia-auth-mobile-copy max-w-86 md:max-w-[29rem]">
            <h1 className="font-title text-[2.25rem] font-extrabold leading-[0.98] text-title sm:text-[2.55rem] md:text-5xl md:leading-[1.02]">
              Seu <span className="text-primary">apoio</span>
              <span className="block">desde o início</span>
            </h1>

            <p className="mt-4 max-w-84 text-base leading-6 text-text md:mt-5 md:text-lg md:leading-7">
              Algumas das vantagens que você terá
            </p>
          </section>

          <section className="maia-auth-mobile-form flex flex-col gap-6 md:gap-5">
            {supportBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  className="flex min-h-27 items-center gap-5 rounded-[2.3rem] bg-white px-5 py-5 shadow-[0_18px_58px_rgba(140,64,84,0.1)] md:min-h-30 md:px-6"
                  key={benefit.title}
                >
                  <div className="grid size-13 shrink-0 place-items-center rounded-full bg-primary/20 text-primary md:size-14">
                    <Icon
                      fill={benefit.title === "Apoio emocional" ? "currentColor" : "none"}
                      size={26}
                      strokeWidth={benefit.title === "Apoio emocional" ? 0 : 2}
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-title text-lg font-extrabold leading-6 text-title">
                      {benefit.title}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-text md:text-[0.95rem]">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <button
          className="mx-auto flex h-14 w-full max-w-84 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 md:max-w-[25rem]"
          onClick={onContinue}
          type="button"
        >
          <span className="font-extrabold">Continuar</span> <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

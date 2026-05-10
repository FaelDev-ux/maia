"use client";

import { InputMask } from "@react-input/mask";
import { ArrowRight, Baby, CalendarDays, Cake, UsersRound } from "lucide-react";
import { useState } from "react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import cn from "@/lib/utils";
import type { BabyGender } from "../types";

const digitReplacement = { _: /\d/ };

type RecentMotherBabyInfoStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function RecentMotherBabyInfoStep({ onBack, onContinue }: RecentMotherBabyInfoStepProps) {
  const [gender, setGender] = useState<BabyGender | null>(null);

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col px-6 pb-7 pt-6 md:max-w-[64rem] md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-84 sm:max-w-96 md:max-w-[32rem]">
          <HeaderOnboarding currentStep={2} totalSteps={3} onBack={onBack} />
        </div>

        <div className="mx-auto flex w-full flex-1 flex-col justify-center gap-9 py-10 md:grid md:max-w-[58rem] md:grid-cols-[minmax(0,0.92fr)_minmax(22rem,25rem)] md:items-center md:gap-12 md:py-8">
          <section className="maia-auth-mobile-copy max-w-86 md:max-w-[29rem] md:self-center">
            <h1 className="font-title text-[2.35rem] font-extrabold leading-[0.95] text-title sm:text-[2.6rem] md:text-5xl md:leading-[1.02]">
              Conte-nos sobre <span className="block text-primary md:inline">seu filho</span>
            </h1>

            <p className="mt-4 max-w-80 text-base leading-6 text-text md:mt-5 md:max-w-[25rem] md:text-lg md:leading-7">
              Informe alguns dados para personalizarmos seu conteúdo com dicas e apoio no momento
              certo.
            </p>
          </section>

          <section className="maia-auth-mobile-form rounded-[2.2rem] bg-white px-7 py-8 shadow-[0_22px_70px_rgba(140,64,84,0.12)] md:px-8 md:py-9">
            <form className="space-y-7">
              <div>
                <label
                  className="mb-4 flex items-center gap-3 text-sm font-extrabold text-text"
                  htmlFor="baby-name"
                >
                  <Baby className="text-primary" size={20} />
                  Nome do bebê <span className="text-primary">*</span>
                </label>

                <input
                  className="h-16 w-full rounded-full border border-transparent bg-surface px-6 text-sm font-medium text-title outline-none transition placeholder:text-text/40 focus:border-primary focus:bg-white sm:text-base"
                  id="baby-name"
                  placeholder="Como se chama seu pequeno(a)?"
                  type="text"
                />
              </div>

              <fieldset>
                <legend className="mb-4 flex items-center gap-3 text-sm font-extrabold text-text">
                  <UsersRound className="text-primary" size={20} />
                  Gênero <span className="text-primary">*</span>
                </legend>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    className={cn(
                      "h-14 rounded-full bg-surface px-4 text-sm font-semibold text-text transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                      gender === "girl" && "bg-primary text-white shadow-button hover:bg-primary"
                    )}
                    onClick={() => setGender("girl")}
                    type="button"
                  >
                    Menina
                  </button>
                  <button
                    className={cn(
                      "h-14 rounded-full bg-surface px-4 text-sm font-semibold text-text transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                      gender === "boy" && "bg-primary text-white shadow-button hover:bg-primary"
                    )}
                    onClick={() => setGender("boy")}
                    type="button"
                  >
                    Menino
                  </button>
                </div>
              </fieldset>

              <div>
                <label
                  className="mb-4 flex items-center gap-3 text-sm font-extrabold text-text"
                  htmlFor="baby-birth-date"
                >
                  <Cake className="text-primary" size={20} />
                  Data de Nascimento <span className="text-primary">*</span>
                </label>

                <div className="flex h-16 items-center gap-4 rounded-full border border-transparent bg-surface px-5 transition focus-within:border-primary focus-within:bg-white">
                  <CalendarDays className="shrink-0 text-title/70" size={18} />
                  <InputMask
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-title outline-none placeholder:text-text/40 sm:text-base"
                    id="baby-birth-date"
                    mask="__/__/____"
                    placeholder="dd / mm / yyyy"
                    replacement={digitReplacement}
                    separate
                    type="text"
                  />
                </div>
              </div>
            </form>
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

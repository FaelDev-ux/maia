"use client";

import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import OptionsList from "@/features/onboarding/components/OptionsList";
import { useState } from "react";

export default function SelectType() {
  const [currentStep, setCurrentStep] = useState(3);

  return (
    <div className="w-full p-6 flex flex-col items-between">
      <HeaderOnboarding
        currentStep={currentStep}
        totalSteps={3}
        onBack={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
      />
      <div className="flex w-full flex-col md:flex-row justify-center md:gap-20 items-center">
        <div className="flex flex-col gap-5">
          <h1 className="font-title text-[2.5rem] font-extrabold leading-tight text-title md:text-5xl">
            Quem é <span className="text-primary">você?</span>
          </h1>
          <p className="text-sm leading-6 text-text md:text-base max-w-70">
            Para personalizarmos a sua experiência, conte-nos um pouco sobre a sua jornada.
          </p>
        </div>

        <div className="shrink-0 flex gap-5 flex-col items-center">
          <OptionsList />

          <button
            className="flex h-14 w-full max-w-84 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
            // onClick={}
            type="button"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

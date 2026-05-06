"use client";

import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import { useState } from "react";

export default function SelectType() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="w-full p-5 flex flex-col gap-5">
      <HeaderOnboarding
        currentStep={currentStep}
        totalSteps={3}
        onBack={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
      />
      <div className="w-full flex flex-col gap-5">
        <h1 className="font-title text-[2rem] font-extrabold leading-tight text-title md:text-5xl">Quem é <span className="text-primary">você?</span></h1>
        <p className="text-sm leading-6 text-text md:text-base">Para personalizarmos a sua experiência, conte-nos um pouco sobre a sua jornada.</p>
      </div>
    </div>
  );
}

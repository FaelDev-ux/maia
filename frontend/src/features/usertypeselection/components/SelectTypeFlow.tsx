"use client";

import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import OptionsList, { type UserTypeOption } from "@/features/onboarding/components/OptionsList";
import { ExperiencedMotherWelcomeStep } from "@/features/usertypeselection/experienced-mother/components/WelcomeStep";
import { FutureMotherSupportStep } from "@/features/usertypeselection/future-mother/components/SupportStep";
import { FutureMotherWelcomeStep } from "@/features/usertypeselection/future-mother/components/WelcomeStep";
import { HealthProfessionalDataStep } from "@/features/usertypeselection/health-professional/components/DataStep";
import { HealthProfessionalWelcomeStep } from "@/features/usertypeselection/health-professional/components/WelcomeStep";
import { RecentMotherBabyInfoStep } from "@/features/usertypeselection/recent-mother/components/BabyInfoStep";
import { RecentMotherSupportStep } from "@/features/usertypeselection/recent-mother/components/SupportStep";
import { RecentMotherWelcomeStep } from "@/features/usertypeselection/recent-mother/components/WelcomeStep";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";

type SelectTypeStep =
  | "select-type"
  | "recent-mother-welcome"
  | "recent-mother-baby-info"
  | "recent-mother-support"
  | "future-mother-welcome"
  | "future-mother-support"
  | "experienced-mother-welcome"
  | "health-professional-data"
  | "health-professional-welcome";

const validSteps: SelectTypeStep[] = [
  "select-type",
  "recent-mother-welcome",
  "recent-mother-baby-info",
  "recent-mother-support",
  "future-mother-welcome",
  "future-mother-support",
  "experienced-mother-welcome",
  "health-professional-data",
  "health-professional-welcome",
];

const firstStepByOption: Record<UserTypeOption, SelectTypeStep> = {
  "experienced-mother": "experienced-mother-welcome",
  "future-mother": "future-mother-welcome",
  "health-professional": "health-professional-data",
  "recent-mother": "recent-mother-welcome",
};

function isSelectTypeStep(step: string | null): step is SelectTypeStep {
  return validSteps.includes(step as SelectTypeStep);
}

export function SelectTypeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<UserTypeOption>("recent-mother");
  const stepParam = searchParams.get("step");
  const currentStep: SelectTypeStep = isSelectTypeStep(stepParam) ? stepParam : "select-type";

  function goToStep(step: SelectTypeStep) {
    if (step === "select-type") {
      router.push("/auth/select-type");
      return;
    }

    router.push(`/auth/select-type?step=${step}`);
  }

  function renderCurrentStep(): ReactNode {
    if (currentStep === "recent-mother-welcome") {
      return (
        <RecentMotherWelcomeStep
          onBack={() => goToStep("select-type")}
          onContinue={() => goToStep("recent-mother-baby-info")}
        />
      );
    }

    if (currentStep === "recent-mother-baby-info") {
      return (
        <RecentMotherBabyInfoStep
          onBack={() => goToStep("recent-mother-welcome")}
          onContinue={() => goToStep("recent-mother-support")}
        />
      );
    }

    if (currentStep === "recent-mother-support") {
      return <RecentMotherSupportStep onBack={() => goToStep("recent-mother-baby-info")} />;
    }

    if (currentStep === "future-mother-welcome") {
      return (
        <FutureMotherWelcomeStep
          onBack={() => goToStep("select-type")}
          onContinue={() => goToStep("future-mother-support")}
        />
      );
    }

    if (currentStep === "future-mother-support") {
      return <FutureMotherSupportStep onBack={() => goToStep("future-mother-welcome")} />;
    }

    if (currentStep === "experienced-mother-welcome") {
      return <ExperiencedMotherWelcomeStep onBack={() => goToStep("select-type")} />;
    }

    if (currentStep === "health-professional-data") {
      return (
        <HealthProfessionalDataStep
          onBack={() => goToStep("select-type")}
          onContinue={() => goToStep("health-professional-welcome")}
        />
      );
    }

    if (currentStep === "health-professional-welcome") {
      return <HealthProfessionalWelcomeStep onBack={() => goToStep("health-professional-data")} />;
    }

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col bg-background px-6 pb-7 pt-6 text-text md:max-w-[64rem] md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-84 sm:max-w-96 md:max-w-[32rem]">
          <HeaderOnboarding currentStep={1} hideBackButton totalSteps={3} />
        </div>

        <div className="mx-auto flex w-full flex-1 flex-col justify-center gap-8 py-10 md:grid md:max-w-[58rem] md:grid-cols-[minmax(0,0.86fr)_minmax(22rem,26rem)] md:items-center md:gap-14 md:py-8">
          <section className="maia-auth-mobile-copy mx-auto max-w-86 text-center md:mx-0 md:max-w-[28rem] md:text-left">
            <h1 className="font-title text-[2.45rem] font-extrabold leading-[0.98] text-title sm:text-[2.7rem] md:text-5xl md:leading-[1.02]">
              Quem é <span className="text-primary">você?</span>
            </h1>

            <p className="mx-auto mt-4 max-w-76 text-base leading-6 text-text md:mx-0 md:mt-5 md:max-w-[25rem] md:text-lg md:leading-7">
              Para personalizarmos a sua experiência, conte-nos um pouco sobre a sua jornada.
            </p>
          </section>

          <section className="maia-auth-mobile-form mx-auto flex w-full max-w-92 flex-col items-center gap-6 md:max-w-[26rem]">
            <OptionsList selected={selectedOption} onSelect={setSelectedOption} />

            <button
              className="flex h-14 w-full max-w-84 items-center justify-center rounded-full bg-primary px-8 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
              onClick={() => goToStep(firstStepByOption[selectedOption])}
              type="button"
            >
              Continuar
            </button>
          </section>
        </div>
      </main>
    );
  }

  return renderCurrentStep();
}

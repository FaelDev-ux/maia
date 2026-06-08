"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import { getStoredProfileValues, saveProfileValues } from "@/features/profile/data/profile-storage";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { ProfessionalSelectField } from "@/features/usertypeselection/health-professional/components/ProfessionalSelectField";
import {
  professionalCouncilOptions,
  professionalSpecialtyOptions,
  professionalStateOptions,
  type ProfessionalOption,
} from "@/features/usertypeselection/health-professional/data/professional-options";

type HealthProfessionalDataStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

type ProfessionalSelectId = "professional-council" | "professional-specialty" | "professional-state";

function getOptionValue(options: ProfessionalOption[], value: string, fallback = "") {
  return options.find((option) => option.value === value || option.label === value)?.value ?? fallback;
}

function getProfileSpecialtyValue(specialty: string) {
  if (!specialty) {
    return "";
  }

  return getOptionValue(professionalSpecialtyOptions, specialty, "other");
}

function getSpecialtyLabel(value: string, customSpecialty: string) {
  if (value === "other") {
    return customSpecialty.trim();
  }

  return professionalSpecialtyOptions.find((option) => option.value === value)?.label ?? "";
}

export function HealthProfessionalDataStep({
  onBack,
  onContinue,
}: HealthProfessionalDataStepProps) {
  const storedProfileValues = useStoredProfileValues("health-professional");
  const [openSelectId, setOpenSelectId] = useState<ProfessionalSelectId | null>(null);
  const [registrationNumberDraft, setRegistrationNumberDraft] = useState<string | null>(null);
  const [selectedCouncilDraft, setSelectedCouncilDraft] = useState<string | null>(null);
  const [selectedStateDraft, setSelectedStateDraft] = useState<string | null>(null);
  const [selectedSpecialtyDraft, setSelectedSpecialtyDraft] = useState<string | null>(null);
  const [customSpecialtyDraft, setCustomSpecialtyDraft] = useState<string | null>(null);
  const storedCouncil = getOptionValue(professionalCouncilOptions, storedProfileValues.council, "CRM");
  const storedState = getOptionValue(professionalStateOptions, storedProfileValues.state);
  const storedSpecialty = getProfileSpecialtyValue(storedProfileValues.specialty);
  const registrationNumber = registrationNumberDraft ?? storedProfileValues.registrationNumber;
  const selectedCouncil = selectedCouncilDraft ?? storedCouncil;
  const selectedState = selectedStateDraft ?? storedState;
  const selectedSpecialty = selectedSpecialtyDraft ?? storedSpecialty;
  const customSpecialty =
    customSpecialtyDraft ?? (storedSpecialty === "other" ? storedProfileValues.specialty : "");

  function handleSelectOpenChange(selectId: ProfessionalSelectId, isOpen: boolean) {
    setOpenSelectId(isOpen ? selectId : null);
  }

  function handleSpecialtyChange(value: string) {
    setSelectedSpecialtyDraft(value);

    if (value !== "other") {
      setCustomSpecialtyDraft("");
    }
  }

  function handleContinue() {
    const currentProfileValues = getStoredProfileValues("health-professional");

    saveProfileValues(
      {
        ...currentProfileValues,
        council: selectedCouncil,
        registrationNumber: registrationNumber.trim(),
        specialty: getSpecialtyLabel(selectedSpecialty, customSpecialty),
        state: selectedState,
      },
      "health-professional"
    );
    onContinue();
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col px-6 pb-7 pt-6 md:max-w-[64rem] md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-84 sm:max-w-96 md:max-w-[32rem]">
          <HeaderOnboarding currentStep={2} totalSteps={3} onBack={onBack} />
        </div>

        <div className="mx-auto flex w-full flex-1 flex-col justify-center gap-9 py-10 md:grid md:max-w-[58rem] md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,26rem)] md:items-center md:gap-14 md:py-8">
          <section className="maia-auth-mobile-copy mx-auto max-w-86 text-center md:mx-0 md:max-w-[29rem] md:text-left">
            <h1 className="font-title text-[2.35rem] font-extrabold leading-[0.98] text-title sm:text-[2.65rem] md:text-5xl md:leading-[1.02]">
              Dados <span className="block text-primary">profissionais</span>
            </h1>

            <p className="mx-auto mt-10 max-w-84 text-lg leading-7 text-text md:mx-0 md:mt-6 md:max-w-[26rem] md:text-xl md:leading-8">
              Precisamos verificar seu registro para identificar suas orientações na comunidade.
            </p>
          </section>

          <section className="maia-auth-mobile-form rounded-[2.2rem] bg-white px-7 py-8 shadow-[0_22px_70px_rgba(140,64,84,0.12)] md:px-8 md:py-9">
            <form className="space-y-5">
              <div>
                <label
                  className="mb-3 block text-[0.68rem] font-extrabold uppercase leading-4 tracking-[0.22em] text-text"
                  htmlFor="professional-register"
                >
                  Número do registro <span className="text-primary">*</span>
                </label>

                <div className="flex min-h-13 items-center gap-4 rounded-full border border-transparent bg-surface px-5 py-3 transition focus-within:border-primary focus-within:bg-white sm:min-h-14">
                  <BadgeCheck className="shrink-0 text-title/65" size={17} />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-title outline-none placeholder:text-text/40 sm:text-base"
                    id="professional-register"
                    onChange={(event) => setRegistrationNumberDraft(event.target.value)}
                    placeholder="Ex.: 123456"
                    type="text"
                    value={registrationNumber}
                  />
                </div>
              </div>

              <ProfessionalSelectField
                id="professional-council"
                isOpen={openSelectId === "professional-council"}
                label="Conselho profissional"
                onChange={setSelectedCouncilDraft}
                onOpenChange={(isOpen) => handleSelectOpenChange("professional-council", isOpen)}
                options={professionalCouncilOptions}
                required
                value={selectedCouncil}
              />

              <ProfessionalSelectField
                id="professional-state"
                isOpen={openSelectId === "professional-state"}
                label="Estado (UF)"
                onChange={setSelectedStateDraft}
                onOpenChange={(isOpen) => handleSelectOpenChange("professional-state", isOpen)}
                options={professionalStateOptions}
                required
                value={selectedState}
              />

              <ProfessionalSelectField
                id="professional-specialty"
                isOpen={openSelectId === "professional-specialty"}
                label="Especialidade"
                onChange={handleSpecialtyChange}
                onOpenChange={(isOpen) => handleSelectOpenChange("professional-specialty", isOpen)}
                options={professionalSpecialtyOptions}
                value={selectedSpecialty}
              />

              {selectedSpecialty === "other" ? (
                <div>
                  <label
                    className="mb-3 block text-[0.68rem] font-extrabold uppercase leading-4 tracking-[0.22em] text-text"
                    htmlFor="professional-custom-specialty"
                  >
                    Escreva sua especialidade
                  </label>

                  <div className="flex min-h-13 items-center gap-4 rounded-full border border-transparent bg-surface px-5 py-3 transition focus-within:border-primary focus-within:bg-white sm:min-h-14">
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-title outline-none placeholder:text-text/40 sm:text-base"
                      id="professional-custom-specialty"
                      onChange={(event) => setCustomSpecialtyDraft(event.target.value)}
                      placeholder="Ex.: consultoria em amamentação"
                      type="text"
                      value={customSpecialty}
                    />
                  </div>
                </div>
              ) : null}
            </form>
          </section>
        </div>

        <button
          className="mx-auto flex h-14 w-full max-w-84 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-16 sm:max-w-92 sm:text-base"
          onClick={handleContinue}
          type="button"
        >
          <span className="font-extrabold">Continuar</span> <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

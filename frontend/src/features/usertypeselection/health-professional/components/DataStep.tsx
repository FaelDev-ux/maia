"use client";

import { ArrowRight, Check, ChevronDown, Mail, Search } from "lucide-react";
import { useState } from "react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import { getStoredProfileValues, saveProfileValues } from "@/features/profile/data/profile-storage";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import cn from "@/lib/utils";
import {
  type ProfessionalOption,
  professionalSpecialtyOptions,
  professionalStateOptions,
} from "../data/professional-options";

type ProfessionalSelectFieldProps = {
  id: string;
  isOpen: boolean;
  label: string;
  onChange?: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: ProfessionalOption[];
  required?: boolean;
  value?: string;
};

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function getProfileStateValue(state: string) {
  return (
    professionalStateOptions.find((option) => option.value === state || option.label === state)
      ?.value ?? ""
  );
}

function getProfileSpecialtyValue(specialty: string) {
  if (!specialty) {
    return "";
  }

  return (
    professionalSpecialtyOptions.find(
      (option) => option.value === specialty || option.label === specialty
    )?.value ?? "other"
  );
}

function getSpecialtyLabel(value: string, customSpecialty: string) {
  if (value === "other") {
    return customSpecialty.trim();
  }

  return professionalSpecialtyOptions.find((option) => option.value === value)?.label ?? "";
}

function ProfessionalSelectField({
  id,
  isOpen,
  label,
  onChange,
  onOpenChange,
  options,
  required = false,
  value,
}: ProfessionalSelectFieldProps) {
  const [internalSelectedValue, setInternalSelectedValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const selectedValue = value ?? internalSelectedValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const normalizedSearchQuery = normalizeSearchValue(searchQuery.trim());
  const filteredOptions = normalizedSearchQuery
    ? options.filter((option) => normalizeSearchValue(option.label).includes(normalizedSearchQuery))
    : options;

  function handleSelect(value: string) {
    setInternalSelectedValue(value);
    onChange?.(value);
    onOpenChange(false);
    setSearchQuery("");
  }

  function handleToggleOptions() {
    setSearchQuery("");
    onOpenChange(!isOpen);
  }

  function handleCloseOptions() {
    setSearchQuery("");
    onOpenChange(false);
  }

  return (
    <div className="relative">
      <label
        className="mb-3 block text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-text"
        htmlFor={id}
      >
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="group flex h-13 w-full items-center gap-4 rounded-full border border-transparent bg-surface px-5 text-sm font-medium transition hover:bg-primary/10 focus-visible:border-primary focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-14 sm:text-base"
        id={id}
        onClick={handleToggleOptions}
        type="button"
      >
        <ChevronDown
          className={cn(
            "shrink-0 text-title/70 transition group-hover:text-primary",
            isOpen && "rotate-180 text-primary"
          )}
          size={18}
        />
        <span
          className={cn(
            "min-w-0 flex-1 text-left text-text/45",
            selectedOption && "font-semibold text-title"
          )}
        >
          {selectedOption?.label ?? "Selecione uma opção"}
        </span>
      </button>

      {isOpen && (
        <>
          <button
            aria-label={`Fechar seleção de ${label.toLowerCase()}`}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={handleCloseOptions}
            type="button"
          />

          <div className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-3rem),22rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.45rem] border border-border bg-white p-1.5 shadow-[0_18px_44px_rgba(140,64,84,0.14)]">
            <label
              className="relative block border-b border-border/70 px-3 py-3"
              htmlFor={`${id}-search`}
            >
              <Search
                aria-hidden
                className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-title/55"
                size={16}
                strokeWidth={2.3}
              />
              <input
                autoComplete="off"
                className="h-11 w-full rounded-full bg-surface pl-10 pr-4 text-sm font-semibold text-title outline-none transition placeholder:text-text/45 focus:bg-white focus:ring-2 focus:ring-primary/30"
                id={`${id}-search`}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Buscar ${label.toLowerCase()}`}
                type="search"
                value={searchQuery}
              />
            </label>

            <div className="h-[20rem] max-h-[calc(100dvh-8.5rem)] overflow-y-auto" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === selectedValue;

                  return (
                    <button
                      aria-selected={isSelected}
                      className={cn(
                        "flex h-16 w-full items-center justify-between gap-4 border-b border-border/70 px-4 text-left text-sm font-semibold leading-5 text-text transition last:border-b-0 hover:bg-primary/10 hover:text-title focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                        isSelected && "bg-primary/15 text-title"
                      )}
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      role="option"
                      type="button"
                    >
                      <span className="min-w-0 flex-1 whitespace-normal break-words">
                        {option.label}
                      </span>
                      {isSelected ? <Check className="shrink-0 text-primary" size={16} /> : null}
                    </button>
                  );
                })
              ) : (
                <p className="flex h-full items-center justify-center px-5 text-center text-sm font-semibold leading-6 text-text">
                  Nenhuma opção encontrada.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type HealthProfessionalDataStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

type ProfessionalSelectId = "professional-specialty" | "professional-state";

export function HealthProfessionalDataStep({
  onBack,
  onContinue,
}: HealthProfessionalDataStepProps) {
  const storedProfileValues = useStoredProfileValues("health-professional");
  const [openSelectId, setOpenSelectId] = useState<ProfessionalSelectId | null>(null);
  const [registrationNumberDraft, setRegistrationNumberDraft] = useState<string | null>(null);
  const [selectedStateDraft, setSelectedStateDraft] = useState<string | null>(null);
  const [selectedSpecialtyDraft, setSelectedSpecialtyDraft] = useState<string | null>(null);
  const [customSpecialtyDraft, setCustomSpecialtyDraft] = useState<string | null>(null);
  const storedState = getProfileStateValue(storedProfileValues.state);
  const storedSpecialty = getProfileSpecialtyValue(storedProfileValues.specialty);
  const registrationNumber = registrationNumberDraft ?? storedProfileValues.registrationNumber;
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
              Precisamos verificar seu registro para liberar recursos exclusivos
            </p>
          </section>

          <section className="maia-auth-mobile-form rounded-[2.2rem] bg-white px-7 py-8 shadow-[0_22px_70px_rgba(140,64,84,0.12)] md:px-8 md:py-9">
            <form className="space-y-5">
              <div>
                <label
                  className="mb-3 block text-[0.68rem] font-extrabold uppercase leading-4 tracking-[0.22em] text-text"
                  htmlFor="professional-register"
                >
                  Número do Registro <span className="text-primary">*</span>
                  <span className="block">(CRM/CRP/COREN)</span>
                </label>

                <div className="flex h-13 items-center gap-4 rounded-full border border-transparent bg-surface px-5 transition focus-within:border-primary focus-within:bg-white sm:h-14">
                  <Mail className="shrink-0 text-title/65" size={17} />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-title outline-none placeholder:text-text/40 sm:text-base"
                    id="professional-register"
                    onChange={(event) => setRegistrationNumberDraft(event.target.value)}
                    placeholder="123456"
                    type="text"
                    value={registrationNumber}
                  />
                </div>
              </div>

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

                  <div className="flex h-13 items-center gap-4 rounded-full border border-transparent bg-surface px-5 transition focus-within:border-primary focus-within:bg-white sm:h-14">
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

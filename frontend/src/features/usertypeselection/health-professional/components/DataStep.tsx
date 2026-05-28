"use client";

import { ArrowRight, Check, ChevronDown, Mail } from "lucide-react";
import { useState } from "react";
import HeaderOnboarding from "@/features/onboarding/components/HeaderOnboarding";
import cn from "@/lib/utils";
import {
  type ProfessionalOption,
  professionalSpecialtyOptions,
  professionalStateOptions,
} from "../data/professional-options";

type ProfessionalSelectFieldProps = {
  id: string;
  label: string;
  options: ProfessionalOption[];
  required?: boolean;
};

function ProfessionalSelectField({
  id,
  label,
  options,
  required = false,
}: ProfessionalSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const selectedOption = options.find((option) => option.value === selectedValue);

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
        onClick={() => setIsOpen((isDropdownOpen) => !isDropdownOpen)}
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
        <div
          className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-[1.45rem] border border-border bg-white p-1.5 shadow-[0_18px_44px_rgba(140,64,84,0.14)]"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "flex h-11 w-full items-center justify-between rounded-full px-4 text-sm font-semibold text-text transition hover:bg-primary/10 hover:text-title",
                  isSelected && "bg-primary/15 text-title"
                )}
                key={option.value}
                onClick={() => {
                  setSelectedValue(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected && <Check className="text-primary" size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type HealthProfessionalDataStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function HealthProfessionalDataStep({
  onBack,
  onContinue,
}: HealthProfessionalDataStepProps) {
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
                    placeholder="123456"
                    type="text"
                  />
                </div>
              </div>

              <ProfessionalSelectField
                id="professional-state"
                label="Estado (UF)"
                options={professionalStateOptions}
                required
              />

              <ProfessionalSelectField
                id="professional-specialty"
                label="Especialidade"
                options={professionalSpecialtyOptions}
              />
            </form>
          </section>
        </div>

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

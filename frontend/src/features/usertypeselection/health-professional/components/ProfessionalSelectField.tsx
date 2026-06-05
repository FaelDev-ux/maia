"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { ProfessionalOption } from "@/features/usertypeselection/health-professional/data/professional-options";
import cn from "@/lib/utils";

type ProfessionalSelectFieldProps = {
  id: string;
  isOpen: boolean;
  label: string;
  onChange?: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: ProfessionalOption[];
  placeholder?: string;
  required?: boolean;
  triggerClassName?: string;
  value?: string;
};

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function ProfessionalSelectField({
  id,
  isOpen,
  label,
  onChange,
  onOpenChange,
  options,
  placeholder = "Selecione uma opção",
  required = false,
  triggerClassName,
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

  function handleSelect(nextValue: string) {
    setInternalSelectedValue(nextValue);
    onChange?.(nextValue);
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
        className={cn(
          "group flex min-h-13 w-full items-center gap-4 rounded-full border border-transparent bg-surface px-5 py-3 text-sm font-medium transition hover:bg-primary/10 focus-visible:border-primary focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-14 sm:text-base",
          triggerClassName
        )}
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
          {selectedOption?.label ?? placeholder}
        </span>
      </button>

      {isOpen ? (
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
                        "flex min-h-16 w-full items-center justify-between gap-4 border-b border-border/70 px-4 py-3 text-left text-sm font-semibold leading-5 text-text transition last:border-b-0 hover:bg-primary/10 hover:text-title focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
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
      ) : null}
    </div>
  );
}

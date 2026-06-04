"use client";

import { InputMask } from "@react-input/mask";
import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: FieldError;
  icon?: ReactNode;
  label: string;
  mask?: string;
  replacement?: Record<string, RegExp>;
  registration: UseFormRegisterReturn;
  required?: boolean;
  separate?: boolean;
  showMask?: boolean;
};

export function AuthInput({
  error,
  icon,
  label,
  mask,
  replacement,
  registration,
  required = true,
  separate,
  showMask,
  id,
  type,
  ...props
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const errorId = error && id ? `${id}-error` : undefined;
  const isPassword = type === "password";
  const inputType = isPassword && isPasswordVisible ? "text" : type;
  const inputClassName =
    "h-full min-w-0 flex-1 bg-transparent text-sm text-title outline-none placeholder:text-text/45 autofill:bg-transparent autofill:transition-colors autofill:duration-[50000s]";

  return (
    <div className="min-w-0 space-y-2">
      <label
        className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-title"
        htmlFor={id}
      >
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <div
        className={`flex h-12 w-full min-w-0 items-center gap-3 rounded-full border py-0 pl-5 pr-4 transition sm:gap-3.5 sm:pl-5 sm:pr-4 ${
          error
            ? "border-danger bg-danger/5"
            : "border-transparent bg-neutral/70 focus-within:border-primary focus-within:bg-white"
        }`}
      >
        {icon && <span className="ml-2 shrink-0 text-text/70 sm:ml-1">{icon}</span>}

        {mask ? (
          <InputMask
            aria-describedby={errorId}
            aria-invalid={Boolean(error)}
            className={inputClassName}
            id={id}
            mask={mask}
            replacement={replacement}
            separate={separate}
            showMask={showMask}
            type={inputType}
            {...registration}
            {...props}
          />
        ) : (
          <input
            aria-describedby={errorId}
            aria-invalid={Boolean(error)}
            className={inputClassName}
            id={id}
            type={inputType}
            {...registration}
            {...props}
          />
        )}

        {isPassword && (
          <button
            aria-label={isPasswordVisible ? "Ocultar senha" : "Exibir senha"}
            className="mr-1 grid size-8 shrink-0 place-items-center rounded-full text-text/65 transition hover:bg-white/70 hover:text-title focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
            type="button"
          >
            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-danger" id={errorId}>
          {error.message}
        </p>
      )}
    </div>
  );
}

import type { InputHTMLAttributes, ReactNode } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: FieldError;
  icon?: ReactNode;
  label: string;
  registration: UseFormRegisterReturn;
  required?: boolean;
};

export function AuthInput({
  error,
  icon,
  label,
  registration,
  required = true,
  id,
  ...props
}: AuthInputProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label
        className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-title"
        htmlFor={id}
      >
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <div
        className={`flex h-12 items-center gap-3 rounded-full border px-4 transition ${
          error
            ? "border-danger bg-danger/5"
            : "border-transparent bg-neutral/70 focus-within:border-primary focus-within:bg-white"
        }`}
      >
        {icon && <span className="text-text/70">{icon}</span>}

        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-title outline-none placeholder:text-text/45 autofill:bg-transparent autofill:transition-colors autofill:duration-[50000s]"
          id={id}
          {...registration}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-danger" id={errorId}>
          {error.message}
        </p>
      )}
    </div>
  );
}

import { ChevronDown } from "lucide-react";
import type { ProfileField, ProfileFormValues } from "@/features/profile/types";

type ProfileFieldControlProps = {
  field: ProfileField;
  onChange: (fieldId: keyof ProfileFormValues, value: string) => void;
  value: string;
};

export function ProfileFieldControl({ field, onChange, value }: ProfileFieldControlProps) {
  const Icon = field.icon;
  const inputId = `profile-${field.id}`;
  const sharedClasses =
    "w-full rounded-full border-0 bg-neutral/75 py-4 pl-14 pr-5 text-base font-medium text-title outline-none ring-1 ring-transparent transition placeholder:text-text/40 focus:bg-white focus:ring-primary/35";

  return (
    <label className="block" htmlFor={inputId}>
      <span className="block px-2 text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-title/75">
        {field.label}
      </span>

      <span className="relative mt-3 block">
        <Icon
          aria-hidden
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-title/70"
          size={20}
          strokeWidth={2.2}
        />

        {field.type === "textarea" ? (
          <textarea
            className="min-h-44 w-full resize-none rounded-[1.5rem] border-0 bg-neutral/75 py-5 pl-14 pr-5 text-base font-medium leading-7 text-title outline-none ring-1 ring-transparent transition placeholder:text-text/40 focus:bg-white focus:ring-primary/35"
            id={inputId}
            onChange={(event) =>
              onChange(field.id as keyof ProfileFormValues, event.target.value)
            }
            placeholder={field.placeholder}
            value={value}
          />
        ) : (
          <input
            className={sharedClasses}
            id={inputId}
            onChange={(event) =>
              onChange(field.id as keyof ProfileFormValues, event.target.value)
            }
            placeholder={field.placeholder}
            type={field.type === "select" ? "text" : field.type}
            value={value}
          />
        )}

        {field.type === "select" ? (
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-title/65"
            size={20}
            strokeWidth={2.2}
          />
        ) : null}
      </span>
    </label>
  );
}

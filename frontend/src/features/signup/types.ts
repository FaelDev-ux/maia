import type { LucideIcon } from "lucide-react";
import type { RegisterFormData } from "@/schemas/auth.schema";

export type SignupField = {
  autoComplete: string;
  icon: LucideIcon;
  label: string;
  mask?: string;
  name: keyof RegisterFormData;
  placeholder: string;
  replacement?: Record<string, RegExp>;
  required: boolean;
  separate?: boolean;
  showMask?: boolean;
  type: "email" | "password" | "text";
};

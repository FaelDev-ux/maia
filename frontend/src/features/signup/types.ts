import type { LucideIcon } from "lucide-react";
import type { RegisterFormData } from "@/schemas/auth.schema";

export type SignupField = {
  autoComplete: string;
  icon: LucideIcon;
  label: string;
  name: keyof RegisterFormData;
  placeholder: string;
  required: boolean;
  type: "email" | "password" | "text";
};

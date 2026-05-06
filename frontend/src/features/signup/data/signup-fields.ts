import { Calendar, Lock, Mail, User } from "lucide-react";
import type { SignupField } from "../types";

export const signupFields: SignupField[] = [
  {
    autoComplete: "name",
    icon: User,
    label: "Seu nome completo",
    name: "name",
    placeholder: "Nome completo",
    required: true,
    type: "text",
  },
  {
    autoComplete: "email",
    icon: Mail,
    label: "E-mail",
    name: "email",
    placeholder: "nome@exemplo.com",
    required: true,
    type: "email",
  },
  {
    autoComplete: "bday",
    icon: Calendar,
    label: "Sua data de nascimento",
    name: "birthDate",
    placeholder: "dd / mm / yyyy",
    required: true,
    type: "text",
  },
  {
    autoComplete: "new-password",
    icon: Lock,
    label: "Senha",
    name: "password",
    placeholder: "••••••••",
    required: true,
    type: "password",
  },
  {
    autoComplete: "new-password",
    icon: Lock,
    label: "Confirmar senha",
    name: "confirmPassword",
    placeholder: "••••••••",
    required: true,
    type: "password",
  },
];

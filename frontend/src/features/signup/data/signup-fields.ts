import { Calendar, Lock, Mail, Phone, User } from "lucide-react";
import type { SignupField } from "../types";

const digitReplacement = { _: /\d/ };

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
    autoComplete: "tel",
    icon: Phone,
    label: "Telefone",
    mask: "(__) _____-____",
    name: "phone",
    placeholder: "(00) 00000-0000",
    replacement: digitReplacement,
    required: true,
    type: "text",
  },
  {
    autoComplete: "bday",
    icon: Calendar,
    label: "Sua data de nascimento",
    mask: "__/__/____",
    name: "birthDate",
    placeholder: "dd / mm / yyyy",
    replacement: digitReplacement,
    required: true,
    separate: true,
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

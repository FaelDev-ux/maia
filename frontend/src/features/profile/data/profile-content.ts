import {
  Baby,
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { HomeProfile } from "@/features/home/types";
import type { ProfileContent } from "@/features/profile/types";

const baseNameField = {
  id: "fullName",
  icon: UserRound,
  label: "Seu nome completo",
  placeholder: "Nome completo",
  type: "text" as const,
};

const baseEmailField = {
  id: "email",
  icon: Mail,
  label: "E-mail",
  placeholder: "nome@exemplo.com",
  type: "email" as const,
};

const basePhoneField = {
  id: "phone",
  icon: Phone,
  label: "Telefone",
  placeholder: "(00) 00000-0000",
  type: "tel" as const,
};

const baseBirthDateField = {
  id: "birthDate",
  icon: CalendarDays,
  label: "Sua data de nascimento",
  placeholder: "dd / mm / aaaa",
  type: "text" as const,
};

export const profileContentByProfile: Record<HomeProfile, ProfileContent> = {
  "recent-mother": {
    profile: "recent-mother",
    title: "Meu perfil",
    intro: "Revise seus dados e mantenha sua conta sempre atualizada",
    fields: [
      baseNameField,
      baseEmailField,
      basePhoneField,
      baseBirthDateField,
      {
        id: "babyBirthDate",
        icon: CalendarDays,
        label: "Data de nascimento do bebê",
        placeholder: "dd / mm / aaaa",
        type: "date",
      },
      {
        id: "bio",
        icon: HeartHandshake,
        label: "Bio",
        placeholder: "Fale um pouco sobre você...",
        type: "textarea",
      },
    ],
  },
  "future-mother": {
    profile: "future-mother",
    title: "Meu perfil",
    intro: "Personalize sua jornada e mantenha seus dados atualizados",
    fields: [
      baseNameField,
      baseEmailField,
      basePhoneField,
      baseBirthDateField,
      {
        id: "journeyMoment",
        icon: Baby,
        label: "Momento da jornada",
        placeholder: "Selecione uma opção",
        type: "select",
      },
      {
        id: "interests",
        icon: HeartHandshake,
        label: "Interesses de apoio",
        placeholder: "Conteúdos, comunidade, preparo emocional...",
        type: "textarea",
      },
    ],
  },
  "experienced-mother": {
    profile: "experienced-mother",
    title: "Meu perfil",
    intro: "Revise seus dados de mentoria e sua presença na comunidade",
    fields: [
      baseNameField,
      baseEmailField,
      basePhoneField,
      baseBirthDateField,
      {
        id: "motherhoodExperience",
        icon: UsersRound,
        label: "Experiência como mãe",
        placeholder: "Ex.: mãe há 4 anos",
        type: "text",
      },
      {
        id: "mentorBio",
        icon: HeartHandshake,
        label: "Como posso apoiar",
        placeholder: "Fale sobre sua vivência e formas de acolhimento...",
        type: "textarea",
      },
    ],
  },
  "health-professional": {
    profile: "health-professional",
    title: "Meu perfil",
    intro: "Revise seus dados e mantenha sua conta sempre atualizada",
    badge: "Profissional verificada",
    fields: [
      baseNameField,
      baseEmailField,
      basePhoneField,
      baseBirthDateField,
      {
        id: "registrationNumber",
        icon: BadgeCheck,
        label: "Número do registro (CRM/CRP/COREN)",
        placeholder: "123456",
        type: "text",
      },
      {
        id: "state",
        icon: MapPin,
        label: "Estado (UF)",
        placeholder: "Selecione uma opção",
        type: "select",
      },
      {
        id: "specialty",
        icon: Stethoscope,
        label: "Especialidade",
        placeholder: "Selecione uma opção",
        type: "select",
      },
    ],
  },
};

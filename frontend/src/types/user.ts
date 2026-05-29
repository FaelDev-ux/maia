export const USER_PROFILE_CODES = ["PUE", "MMT", "DSM", "PRO", "ADM"] as const;

export type UserProfileCode = (typeof USER_PROFILE_CODES)[number];

export type UserProfileSlug =
  | "recent-mother"
  | "experienced-mother"
  | "future-mother"
  | "health-professional"
  | "administrator";

export type UserProfile = {
  code: UserProfileCode;
  slug: UserProfileSlug;
  label: string;
  description: string;
  aliases?: readonly string[];
};

export const USER_PROFILES = {
  PUE: {
    code: "PUE",
    slug: "recent-mother",
    label: "Mãe no puerpério",
    description: "Usuária principal que registra bem-estar, acompanha histórico e participa da comunidade.",
  },
  MMT: {
    code: "MMT",
    slug: "experienced-mother",
    label: "Mãe mentora",
    description: "Mãe experiente que apoia outras mães e compartilha vivências na comunidade.",
  },
  DSM: {
    code: "DSM",
    slug: "future-mother",
    label: "Futura mãe",
    description: "Usuária que deseja ser mãe ou está planejando a maternidade.",
    aliases: ["DS"],
  },
  PRO: {
    code: "PRO",
    slug: "health-professional",
    label: "Profissional de saúde",
    description: "Usuário verificado que contribui com conteúdos técnicos e orientações cuidadosas.",
  },
  ADM: {
    code: "ADM",
    slug: "administrator",
    label: "Administrador",
    description: "Usuário responsável por moderação, gestão e validação de profissionais.",
  },
} as const satisfies Record<UserProfileCode, UserProfile>;

export type ProfessionalVerificationStatus = "not-required" | "pending" | "verified" | "rejected";

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string;
  profileCode: UserProfileCode;
  profileSlug: UserProfileSlug;
  professionalVerificationStatus: ProfessionalVerificationStatus;
  createdAt: string;
  avatarUrl?: string;
};

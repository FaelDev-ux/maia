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

export type UserStatus = "active" | "blocked" | "pending-deletion" | "deleted";

export type ProfessionalVerificationStatus =
  | "not-required"
  | "pending"
  | "verified"
  | "rejected";

export type RecentMotherProfile = {
  babyIds: string[];
  bio?: string;
  supportNeeds?: string[];
};

export type FutureMotherProfile = {
  journeyMoment?: string;
  interests?: string[];
  supportNeeds?: string[];
};

export type MentorProfile = {
  motherhoodExperience?: string;
  mentorBio?: string;
  availableForSupport: boolean;
  supportTopics: string[];
};

export type ProfessionalCouncil = "CRM" | "CRP" | "COREN" | "CREFITO" | "CRN" | "OTHER";

export type ProfessionalProfile = {
  registrationNumber: string;
  council: ProfessionalCouncil;
  state: string;
  specialty: string;
  verifiedAt?: string;
  verifiedBy?: string;
  publicBio?: string;
};

export type UserPrivacySettings = {
  defaultAnonymousCommunityPost: boolean;
  showAvatarInCommunity: boolean;
  allowPersonalizedRecommendations: boolean;
  allowUsageAnalytics: boolean;
};

export type UserNotificationSummary = {
  dailyCheckInEnabled: boolean;
  pushEnabled: boolean;
  timezone: string;
};

export type UserStats = {
  checkInsCount: number;
  postsCount: number;
  repliesCount: number;
  supportsGivenCount: number;
  supportsReceivedCount: number;
  lastCheckInAt?: string;
  lastCommunityActivityAt?: string;
};

export type UserOnboardingState = {
  completed: boolean;
  selectedProfileAt?: string;
  completedAt?: string;
  completedSteps: string[];
};

export type User = {
  id: string;
  authUid: string;

  fullName: string;
  normalizedName: string;
  firstName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  birthDate: string;
  avatarUrl?: string;

  profileCode: UserProfileCode;
  profileSlug: UserProfileSlug;
  roles: UserProfileCode[];
  status: UserStatus;

  professionalVerificationStatus: ProfessionalVerificationStatus;
  professional?: ProfessionalProfile;
  recentMother?: RecentMotherProfile;
  futureMother?: FutureMotherProfile;
  mentor?: MentorProfile;

  privacy: UserPrivacySettings;
  notificationSummary: UserNotificationSummary;
  stats: UserStats;
  onboarding: UserOnboardingState;

  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
};

export type AuthenticatedUser = User;

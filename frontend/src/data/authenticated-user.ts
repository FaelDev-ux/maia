import { USER_PROFILES, type AuthenticatedUser } from "@/types/user";

export const mockAuthenticatedUser = {
  id: "mock-user-pue-001",
  authUid: "mock-user-pue-001",
  fullName: "Usuária Maia",
  normalizedName: "usuaria maia",
  firstName: "Usuária",
  email: "maia.demo@example.com",
  emailVerified: true,
  phone: "(85) 99999-0000",
  birthDate: "1995-05-12",
  avatarUrl:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
  profileCode: "PUE",
  profileSlug: USER_PROFILES.PUE.slug,
  roles: ["PUE"],
  status: "active",
  professionalVerificationStatus: "not-required",
  recentMother: {
    babyIds: [],
    bio: "Vivendo o puerpério com apoio da Maia e da minha rede.",
  },
  privacy: {
    defaultAnonymousCommunityPost: false,
    showAvatarInCommunity: true,
    allowPersonalizedRecommendations: true,
    allowUsageAnalytics: false,
  },
  notificationSummary: {
    dailyCheckInEnabled: false,
    pushEnabled: false,
    timezone: "America/Sao_Paulo",
  },
  stats: {
    checkInsCount: 0,
    postsCount: 0,
    repliesCount: 0,
    supportsGivenCount: 0,
    supportsReceivedCount: 0,
  },
  onboarding: {
    completed: true,
    completedSteps: ["register"],
  },
  acceptedTermsVersion: "mock-2026-06",
  acceptedPrivacyVersion: "mock-2026-06",
  createdAt: "2026-05-29T00:00:00.000Z",
  updatedAt: "2026-05-29T00:00:00.000Z",
  lastLoginAt: "2026-06-03T00:00:00.000Z",
} satisfies AuthenticatedUser;

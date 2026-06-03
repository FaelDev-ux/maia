import { USER_PROFILES, type AuthenticatedUser } from "@/types/user";

export const mockAuthenticatedUser = {
  id: "mock-user-pue-001",
  fullName: "Usuária Maia",
  email: "maia.demo@example.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
  profileCode: "PUE",
  profileSlug: USER_PROFILES.PUE.slug,
  professionalVerificationStatus: "verified",
  createdAt: "2026-05-29T00:00:00.000Z",
} satisfies AuthenticatedUser;

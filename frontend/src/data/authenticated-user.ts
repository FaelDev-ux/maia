import { USER_PROFILES, type AuthenticatedUser } from "@/types/user";

export const mockAuthenticatedUser = {
  id: "mock-user-pue-001",
  fullName: "Usuária Maia",
  email: "maia.demo@example.com",
  profileCode: "PUE",
  profileSlug: USER_PROFILES.PUE.slug,
  professionalVerificationStatus: "not-required",
  createdAt: "2026-05-29T00:00:00.000Z",
} satisfies AuthenticatedUser;

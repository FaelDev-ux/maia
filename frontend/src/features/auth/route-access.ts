import { redirect } from "next/navigation";
import type { HomeProfile } from "@/features/home/types";
import type { AuthenticatedUser, UserProfileCode } from "@/types/user";

const appProfileCodes = ["PUE", "MMT", "DSM", "PRO", "ADM"] as const satisfies readonly UserProfileCode[];
const checkInProfileCodes = ["PUE", "ADM"] as const satisfies readonly UserProfileCode[];
const adminProfileCodes = ["ADM"] as const satisfies readonly UserProfileCode[];

export const appRouteAccess = {
  admin: adminProfileCodes,
  app: appProfileCodes,
  checkIn: checkInProfileCodes,
} as const;

function getUserRoles(user: AuthenticatedUser) {
  return new Set<UserProfileCode>([user.profileCode, ...user.roles]);
}

export function userHasAnyRole(
  user: AuthenticatedUser | null | undefined,
  allowedRoles: readonly UserProfileCode[]
) {
  if (!user) {
    return false;
  }

  const userRoles = getUserRoles(user);

  return allowedRoles.some((role) => userRoles.has(role));
}

export function canAccessCheckInRoutes(user: AuthenticatedUser | null | undefined) {
  return userHasAnyRole(user, appRouteAccess.checkIn);
}

export function canAccessCheckInRoutesByProfile(profile: HomeProfile) {
  return profile === "recent-mother";
}

export function getDefaultAuthorizedRoute(user: AuthenticatedUser) {
  if (userHasAnyRole(user, appRouteAccess.app)) {
    return "/home";
  }

  if (userHasAnyRole(user, appRouteAccess.admin)) {
    return "/admin";
  }

  return "/auth?mode=login";
}

export function requireRouteRoles(
  user: AuthenticatedUser | null | undefined,
  allowedRoles: readonly UserProfileCode[]
): asserts user is AuthenticatedUser {
  if (!user) {
    redirect("/auth?mode=login");
  }

  if (!userHasAnyRole(user, allowedRoles)) {
    redirect(getDefaultAuthorizedRoute(user));
  }
}

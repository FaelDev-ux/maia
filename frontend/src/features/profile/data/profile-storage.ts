import type { HomeProfile } from "@/features/home/types";
import type { ProfileFormValues } from "@/features/profile/types";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import type { RegisterFormData } from "@/schemas/auth.schema";
import {
  USER_PROFILES,
  type ProfessionalCouncil,
  type ProfessionalVerificationStatus,
  type User,
  type UserProfileCode,
} from "@/types/user";

export const PROFILE_UPDATED_EVENT = "maia-profile-updated";

const profileCodeByHomeProfile: Record<HomeProfile, UserProfileCode> = {
  "experienced-mother": "MMT",
  "future-mother": "DSM",
  "health-professional": "PRO",
  "recent-mother": "PUE",
};

let currentUserProfile: User | null = null;
let currentUserProfileSnapshot = "";

function emitProfileUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  }
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getFirstName(fullName: string) {
  return fullName.trim().split(" ")[0] || "Maia";
}

function getIsoTimestamp() {
  return new Date().toISOString();
}

function getProfileCode(profile: HomeProfile) {
  return profileCodeByHomeProfile[profile];
}

function getProfileSlug(profile: HomeProfile) {
  return USER_PROFILES[getProfileCode(profile)].slug;
}

function getProfessionalCouncilValue(value?: string): ProfessionalCouncil {
  if (
    value === "CRM" ||
    value === "CRP" ||
    value === "COREN" ||
    value === "CREFITO" ||
    value === "CRN" ||
    value === "OTHER"
  ) {
    return value;
  }

  return "OTHER";
}

function formatDateForProfile(value?: string) {
  if (!value) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

function parseProfileDate(value: string) {
  const trimmedValue = value.trim();
  const brazilianDateMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (brazilianDateMatch) {
    const [, day, month, year] = brazilianDateMatch;

    return `${year}-${month}-${day}`;
  }

  return trimmedValue;
}

function joinTextList(values?: string[]) {
  return values?.join(", ") ?? "";
}

function splitTextList(value: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDefaultProfessionalVerificationStatus(
  profile: HomeProfile
): ProfessionalVerificationStatus {
  return profile === "health-professional" ? "pending" : "not-required";
}

export function getDefaultUserProfile(profile: HomeProfile): User {
  const code = getProfileCode(profile);
  const now = getIsoTimestamp();
  const fullName = "Usuaria Maia";

  return {
    id: `user-${code.toLowerCase()}`,
    authUid: `user-${code.toLowerCase()}`,
    fullName,
    normalizedName: normalizeName(fullName),
    firstName: getFirstName(fullName),
    email: "",
    emailVerified: false,
    phone: "",
    birthDate: "",
    avatarUrl: undefined,
    profileCode: code,
    profileSlug: getProfileSlug(profile),
    roles: [code],
    status: "active",
    professionalVerificationStatus: getDefaultProfessionalVerificationStatus(profile),
    professional:
      profile === "health-professional"
        ? {
            registrationNumber: "",
            council: "CRM",
            state: "",
            specialty: "",
          }
        : undefined,
    recentMother:
      profile === "recent-mother"
        ? {
            babyIds: [],
            bio: "",
          }
        : undefined,
    futureMother:
      profile === "future-mother"
        ? {
            interests: [],
            journeyMoment: "",
          }
        : undefined,
    mentor:
      profile === "experienced-mother"
        ? {
            availableForSupport: true,
            mentorBio: "",
            motherhoodExperience: "",
            supportTopics: [],
          }
        : undefined,
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
      completedAt: now,
      completedSteps: [],
    },
    acceptedTermsVersion: "pending",
    acceptedPrivacyVersion: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

function isStoredUserProfile(value: unknown): value is Partial<User> {
  return typeof value === "object" && value !== null && "profileCode" in value;
}

function mergeUserWithProfileDefaults(user: Partial<User>, profile: HomeProfile): User {
  const defaults = getDefaultUserProfile(profile);
  const code = getProfileCode(profile);
  const profileSlug = getProfileSlug(profile);
  const fullName = user.fullName?.trim() || defaults.fullName;

  return {
    ...defaults,
    ...user,
    fullName,
    normalizedName: normalizeName(fullName),
    firstName: getFirstName(fullName),
    email: user.email ?? defaults.email,
    phone: user.phone ?? defaults.phone,
    birthDate: user.birthDate ?? defaults.birthDate,
    profileCode: code,
    profileSlug,
    roles: Array.from(new Set([...(user.roles ?? []), code])),
    professionalVerificationStatus:
      profile === "health-professional"
        ? (user.professionalVerificationStatus ?? defaults.professionalVerificationStatus)
        : "not-required",
    professional:
      profile === "health-professional"
        ? {
            council: user.professional?.council ?? defaults.professional?.council ?? "CRM",
            registrationNumber:
              user.professional?.registrationNumber ??
              defaults.professional?.registrationNumber ??
              "",
            state: user.professional?.state ?? defaults.professional?.state ?? "",
            specialty: user.professional?.specialty ?? defaults.professional?.specialty ?? "",
            verifiedAt: user.professional?.verifiedAt,
            verifiedBy: user.professional?.verifiedBy,
            publicBio: user.professional?.publicBio,
          }
        : user.professional,
    privacy: {
      ...defaults.privacy,
      ...user.privacy,
    },
    notificationSummary: {
      ...defaults.notificationSummary,
      ...user.notificationSummary,
    },
    stats: {
      ...defaults.stats,
      ...user.stats,
    },
    onboarding: {
      ...defaults.onboarding,
      ...user.onboarding,
    },
  };
}

export function getUserProfileFromSnapshot(snapshot: string, profile: HomeProfile): User {
  if (!snapshot) {
    return getDefaultUserProfile(profile);
  }

  try {
    const parsedProfile = JSON.parse(snapshot) as unknown;

    return isStoredUserProfile(parsedProfile)
      ? mergeUserWithProfileDefaults(parsedProfile, profile)
      : getDefaultUserProfile(profile);
  } catch {
    return getDefaultUserProfile(profile);
  }
}

export function userProfileToFormValues(user: User, profile: HomeProfile): ProfileFormValues {
  const profileDefaults = getDefaultUserProfile(profile);
  const professional = user.professional ?? profileDefaults.professional;
  const recentMother = user.recentMother ?? profileDefaults.recentMother;
  const futureMother = user.futureMother ?? profileDefaults.futureMother;
  const mentor = user.mentor ?? profileDefaults.mentor;

  return {
    avatarUrl: user.avatarUrl ?? "",
    babyBirthDate: "",
    bio: recentMother?.bio ?? "",
    birthDate: formatDateForProfile(user.birthDate),
    council: professional?.council ?? "",
    email: user.email,
    fullName: user.fullName,
    interests: joinTextList(futureMother?.interests),
    journeyMoment: futureMother?.journeyMoment ?? "",
    mentorBio: mentor?.mentorBio ?? "",
    motherhoodExperience: mentor?.motherhoodExperience ?? "",
    password: "",
    phone: user.phone,
    registrationNumber: professional?.registrationNumber ?? "",
    specialty: professional?.specialty ?? "",
    state: professional?.state ?? "",
  };
}

export function profileFormValuesToUser(
  values: ProfileFormValues,
  profile: HomeProfile,
  currentUser: User
): User {
  const code = getProfileCode(profile);
  const profileSlug = getProfileSlug(profile);
  const fullName = values.fullName.trim() || currentUser.fullName;
  const now = getIsoTimestamp();

  return {
    ...currentUser,
    fullName,
    normalizedName: normalizeName(fullName),
    firstName: getFirstName(fullName),
    phone: values.phone.trim(),
    birthDate: parseProfileDate(values.birthDate) || currentUser.birthDate,
    avatarUrl: values.avatarUrl || undefined,
    profileCode: code,
    profileSlug,
    roles: Array.from(new Set([...(currentUser.roles ?? []), code])),
    professionalVerificationStatus:
      profile === "health-professional"
        ? currentUser.professionalVerificationStatus === "verified"
          ? "verified"
          : "pending"
        : "not-required",
    professional:
      profile === "health-professional"
        ? {
            ...(currentUser.professional ?? {
              council: "CRM",
              registrationNumber: "",
              state: "",
              specialty: "",
            }),
            council: getProfessionalCouncilValue(values.council.trim()),
            registrationNumber: values.registrationNumber.trim(),
            state: values.state.trim(),
            specialty: values.specialty.trim(),
          }
        : currentUser.professional,
    recentMother:
      profile === "recent-mother"
        ? {
            ...(currentUser.recentMother ?? { babyIds: [] }),
            bio: values.bio.trim(),
          }
        : currentUser.recentMother,
    futureMother:
      profile === "future-mother"
        ? {
            ...(currentUser.futureMother ?? {}),
            interests: splitTextList(values.interests),
            journeyMoment: values.journeyMoment.trim(),
          }
        : currentUser.futureMother,
    mentor:
      profile === "experienced-mother"
        ? {
            ...(currentUser.mentor ?? {
              availableForSupport: true,
              supportTopics: [],
            }),
            mentorBio: values.mentorBio.trim(),
            motherhoodExperience: values.motherhoodExperience.trim(),
          }
        : currentUser.mentor,
    updatedAt: now,
  };
}

export function getDefaultProfileValues(profile: HomeProfile): ProfileFormValues {
  return userProfileToFormValues(getDefaultUserProfile(profile), profile);
}

export function getStoredUserProfile(profile: HomeProfile): User {
  return currentUserProfile
    ? mergeUserWithProfileDefaults(currentUserProfile, profile)
    : getDefaultUserProfile(profile);
}

export function getStoredUserProfileSnapshot() {
  return currentUserProfileSnapshot;
}

export function getStoredProfileValues(profile: HomeProfile): ProfileFormValues {
  return userProfileToFormValues(getStoredUserProfile(profile), profile);
}

export function saveUserProfile(user: User) {
  currentUserProfile = user;
  currentUserProfileSnapshot = JSON.stringify(user);
  emitProfileUpdated();
}

export function saveAuthenticatedUserProfile(user: unknown) {
  if (!isStoredUserProfile(user)) {
    return;
  }

  saveUserProfile(mergeUserWithProfileDefaults(user, resolveUserProfile(user)));
}

export function saveProfileValues(values: ProfileFormValues, profile: HomeProfile = "recent-mother") {
  saveUserProfile(profileFormValuesToUser(values, profile, getStoredUserProfile(profile)));
}

export function saveRegisteredUserProfile(data: RegisterFormData) {
  saveProfileValues(
    {
      ...getStoredProfileValues("recent-mother"),
      birthDate: data.birthDate,
      email: data.email,
      fullName: data.name,
      password: "",
      phone: data.phone,
    },
    "recent-mother"
  );
}

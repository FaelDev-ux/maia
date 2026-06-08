import { mockAuthenticatedUser } from "@/data/authenticated-user";
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

export const PROFILE_STORAGE_KEY = "maia-profile-data";
export const PROFILE_BABIES_STORAGE_KEY = "maia-profile-babies";
export const PROFILE_UPDATED_EVENT = "maia-profile-updated";

type StoredBaby = {
  id: string;
  userId: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
};

const profileCodeByHomeProfile: Record<HomeProfile, UserProfileCode> = {
  "experienced-mother": "MMT",
  "future-mother": "DSM",
  "health-professional": "PRO",
  "recent-mother": "PUE",
};

function emitProfileUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
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

function formatDateForProfile(value: string) {
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

function getPrimaryBabyId(user: User) {
  return user.recentMother?.babyIds[0] ?? `mock-baby-${user.id}`;
}

function getDefaultBabyBirthDate(profile: HomeProfile) {
  return profile === "recent-mother" ? "2026-04-10" : "";
}

function getStoredBabies() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedBabies = window.localStorage.getItem(PROFILE_BABIES_STORAGE_KEY);
    const parsedBabies = storedBabies ? (JSON.parse(storedBabies) as unknown) : [];

    return Array.isArray(parsedBabies) ? (parsedBabies as StoredBaby[]) : [];
  } catch {
    window.localStorage.removeItem(PROFILE_BABIES_STORAGE_KEY);
    return [];
  }
}

function getPrimaryBabyBirthDate(user: User, profile: HomeProfile) {
  if (profile !== "recent-mother") {
    return "";
  }

  const babyId = getPrimaryBabyId(user);
  const storedBaby = getStoredBabies().find((baby) => baby.id === babyId && baby.userId === user.id);

  return formatDateForProfile(storedBaby?.birthDate ?? getDefaultBabyBirthDate(profile));
}

function savePrimaryBabyBirthDate(user: User, babyBirthDate: string) {
  if (typeof window === "undefined" || !babyBirthDate.trim()) {
    return;
  }

  const babyId = getPrimaryBabyId(user);
  const now = getIsoTimestamp();
  const storedBabies = getStoredBabies();
  const nextBaby: StoredBaby = {
    id: babyId,
    userId: user.id,
    birthDate: parseProfileDate(babyBirthDate),
    createdAt:
      storedBabies.find((baby) => baby.id === babyId && baby.userId === user.id)?.createdAt ??
      now,
    updatedAt: now,
  };
  const nextBabies = [
    nextBaby,
    ...storedBabies.filter((baby) => !(baby.id === babyId && baby.userId === user.id)),
  ];

  window.localStorage.setItem(PROFILE_BABIES_STORAGE_KEY, JSON.stringify(nextBabies));
}

function getDefaultProfessionalVerificationStatus(
  profile: HomeProfile
): ProfessionalVerificationStatus {
  return profile === "health-professional" ? "pending" : "not-required";
}

export function getDefaultUserProfile(profile: HomeProfile): User {
  const code = getProfileCode(profile);
  const now = mockAuthenticatedUser.createdAt;
  const fullName = mockAuthenticatedUser.fullName;

  return {
    id: `mock-user-${code.toLowerCase()}-001`,
    authUid: `mock-user-${code.toLowerCase()}-001`,
    fullName,
    normalizedName: normalizeName(fullName),
    firstName: getFirstName(fullName),
    email: mockAuthenticatedUser.email,
    emailVerified: true,
    phone: "(85) 99999-0000",
    birthDate: "1995-05-12",
    avatarUrl: mockAuthenticatedUser.avatarUrl,
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
            babyIds: ["mock-baby-001"],
            bio: "Vivendo o puerpério com apoio da Maia e da minha rede.",
          }
        : undefined,
    futureMother:
      profile === "future-mother"
        ? {
            interests: ["Conteúdos sobre preparo emocional", "rede de apoio", "planejamento"],
            journeyMoment: "Planejando a maternidade",
          }
        : undefined,
    mentor:
      profile === "experienced-mother"
        ? {
            availableForSupport: true,
            mentorBio: "Gosto de acolher mães que estão vivendo os primeiros meses com o bebê.",
            motherhoodExperience: "Mãe há 5 anos",
            supportTopics: ["acolhimento", "rotina", "rede de apoio"],
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
      completedSteps: ["mock"],
      completedAt: now,
    },
    acceptedTermsVersion: "mock-2026-06",
    acceptedPrivacyVersion: "mock-2026-06",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };
}

function isStoredUserProfile(value: unknown): value is Partial<User> {
  return (
    typeof value === "object" &&
    value !== null &&
    "profileCode" in value &&
    "profileSlug" in value &&
    "privacy" in value
  );
}

function mergeUserWithProfileDefaults(user: Partial<User>, profile: HomeProfile): User {
  const defaults = getDefaultUserProfile(profile);
  const code = getProfileCode(profile);
  const profileSlug = getProfileSlug(profile);
  const fullName = user.fullName?.trim() || defaults.fullName;
  const professionalVerificationStatus =
    profile === "health-professional"
      ? user.professionalVerificationStatus === "verified" ||
        user.professionalVerificationStatus === "pending" ||
        user.professionalVerificationStatus === "rejected"
        ? user.professionalVerificationStatus
        : defaults.professionalVerificationStatus
      : "not-required";

  return {
    ...defaults,
    ...user,
    fullName,
    normalizedName: normalizeName(fullName),
    firstName: getFirstName(fullName),
    email: user.email ?? defaults.email,
    phone: user.phone ?? defaults.phone,
    birthDate: user.birthDate ?? defaults.birthDate,
    avatarUrl: user.avatarUrl ?? defaults.avatarUrl,
    profileCode: code,
    profileSlug,
    roles: Array.from(new Set([...(user.roles ?? []), code])),
    status: user.status ?? defaults.status,
    professionalVerificationStatus,
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
            verifiedAt: user.professional?.verifiedAt ?? defaults.professional?.verifiedAt,
            verifiedBy: user.professional?.verifiedBy ?? defaults.professional?.verifiedBy,
            publicBio: user.professional?.publicBio ?? defaults.professional?.publicBio,
          }
        : user.professional,
    recentMother:
      profile === "recent-mother"
        ? {
            babyIds: user.recentMother?.babyIds ?? defaults.recentMother?.babyIds ?? [],
            ...user.recentMother,
          }
        : user.recentMother,
    futureMother:
      profile === "future-mother"
        ? {
            ...defaults.futureMother,
            ...user.futureMother,
          }
        : user.futureMother,
    mentor:
      profile === "experienced-mother"
        ? {
            availableForSupport:
              user.mentor?.availableForSupport ?? defaults.mentor?.availableForSupport ?? true,
            supportTopics: user.mentor?.supportTopics ?? defaults.mentor?.supportTopics ?? [],
            mentorBio: user.mentor?.mentorBio ?? defaults.mentor?.mentorBio,
            motherhoodExperience:
              user.mentor?.motherhoodExperience ?? defaults.mentor?.motherhoodExperience,
          }
        : user.mentor,
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
    acceptedTermsVersion: user.acceptedTermsVersion ?? defaults.acceptedTermsVersion,
    acceptedPrivacyVersion: user.acceptedPrivacyVersion ?? defaults.acceptedPrivacyVersion,
    createdAt: user.createdAt ?? defaults.createdAt,
    updatedAt: user.updatedAt ?? defaults.updatedAt,
    lastLoginAt: user.lastLoginAt ?? defaults.lastLoginAt,
  };
}

export function userProfileToFormValues(user: User, profile: HomeProfile): ProfileFormValues {
  const profileDefaults = getDefaultUserProfile(profile);
  const professional = user.professional ?? profileDefaults.professional;
  const recentMother = user.recentMother ?? profileDefaults.recentMother;
  const futureMother = user.futureMother ?? profileDefaults.futureMother;
  const mentor = user.mentor ?? profileDefaults.mentor;

  return {
    avatarUrl: user.avatarUrl ?? "",
    babyBirthDate: getPrimaryBabyBirthDate(user, profile),
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
  const currentBabyIds = currentUser.recentMother?.babyIds ?? [];
  const professionalVerificationStatus =
    profile === "health-professional"
      ? currentUser.professionalVerificationStatus === "verified"
        ? "verified"
        : "pending"
      : "not-required";

  return {
    ...currentUser,
    fullName,
    normalizedName: normalizeName(fullName),
    firstName: getFirstName(fullName),
    email: values.email.trim() || currentUser.email,
    phone: values.phone.trim(),
    birthDate: parseProfileDate(values.birthDate) || currentUser.birthDate,
    avatarUrl: values.avatarUrl || undefined,
    profileCode: code,
    profileSlug,
    roles: Array.from(new Set([...(currentUser.roles ?? []), code])),
    professionalVerificationStatus,
    professional:
      profile === "health-professional"
        ? {
            council: getProfessionalCouncilValue(
              values.council.trim() || currentUser.professional?.council || "CRM"
            ),
            registrationNumber: values.registrationNumber.trim(),
            state: values.state.trim(),
            specialty: values.specialty.trim(),
            verifiedAt:
              professionalVerificationStatus === "verified"
                ? (currentUser.professional?.verifiedAt ?? now)
                : undefined,
            verifiedBy:
              professionalVerificationStatus === "verified"
                ? (currentUser.professional?.verifiedBy ?? "mock-admin-001")
                : undefined,
            publicBio: currentUser.professional?.publicBio,
          }
        : currentUser.professional,
    recentMother:
      profile === "recent-mother"
        ? {
            ...(currentUser.recentMother ?? { babyIds: [] }),
            babyIds: currentBabyIds.length > 0 ? currentBabyIds : [getPrimaryBabyId(currentUser)],
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

export function getUserProfileFromSnapshot(snapshot: string, profile: HomeProfile): User {
  if (!snapshot) {
    return getDefaultUserProfile(profile);
  }

  try {
    const parsedProfile = JSON.parse(snapshot) as unknown;

    if (isStoredUserProfile(parsedProfile)) {
      return mergeUserWithProfileDefaults(parsedProfile, profile);
    }

    const legacyValues = parsedProfile as Partial<ProfileFormValues>;
    const defaultUser = getDefaultUserProfile(profile);
    const legacyFormValues = {
      ...userProfileToFormValues(defaultUser, profile),
      ...legacyValues,
    };

    return profileFormValuesToUser(legacyFormValues, profile, defaultUser);
  } catch {
    return getDefaultUserProfile(profile);
  }
}

export function getDefaultProfileValues(profile: HomeProfile): ProfileFormValues {
  return userProfileToFormValues(getDefaultUserProfile(profile), profile);
}

export function getStoredUserProfile(profile: HomeProfile): User {
  if (typeof window === "undefined") {
    return getDefaultUserProfile(profile);
  }

  const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? "";
  const userProfile = getUserProfileFromSnapshot(storedProfile, profile);

  if (storedProfile) {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
  }

  return userProfile;
}

export function getStoredProfileValues(profile: HomeProfile): ProfileFormValues {
  return userProfileToFormValues(getStoredUserProfile(profile), profile);
}

export function saveUserProfile(user: User) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(user));
  emitProfileUpdated();
}

export function saveAuthenticatedUserProfile(user: unknown) {
  if (typeof window === "undefined" || !isStoredUserProfile(user)) {
    return;
  }

  saveUserProfile(mergeUserWithProfileDefaults(user, resolveUserProfile(user)));
}

export function saveProfileValues(values: ProfileFormValues, profile: HomeProfile = "recent-mother") {
  if (typeof window === "undefined") {
    return;
  }

  const nextUser = profileFormValuesToUser(values, profile, getStoredUserProfile(profile));

  if (profile === "recent-mother") {
    savePrimaryBabyBirthDate(nextUser, values.babyBirthDate);
  }

  saveUserProfile(nextUser);
}

export function saveRegisteredUserProfile(data: RegisterFormData) {
  if (typeof window === "undefined") {
    return;
  }

  const currentValues = getStoredProfileValues("recent-mother");

  saveProfileValues(
    {
      ...currentValues,
      birthDate: data.birthDate,
      email: data.email,
      fullName: data.name,
      password: "",
      phone: data.phone,
    },
    "recent-mother"
  );
}

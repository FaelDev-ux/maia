import { mockAuthenticatedUser } from "@/data/authenticated-user";
import type { HomeProfile } from "@/features/home/types";
import type { ProfileFormValues } from "@/features/profile/types";
import type { RegisterFormData } from "@/schemas/auth.schema";

export const PROFILE_STORAGE_KEY = "maia-profile-data";
export const PROFILE_UPDATED_EVENT = "maia-profile-updated";

const defaultProfileValues: ProfileFormValues = {
  avatarUrl: mockAuthenticatedUser.avatarUrl ?? "",
  babyBirthDate: "",
  bio: "",
  birthDate: "12/05/1995",
  email: mockAuthenticatedUser.email,
  fullName: mockAuthenticatedUser.fullName,
  interests: "",
  journeyMoment: "",
  mentorBio: "",
  motherhoodExperience: "",
  password: "maia-demo-2026",
  phone: "(85) 99999-0000",
  registrationNumber: "",
  specialty: "",
  state: "",
};

const defaultValuesByProfile: Partial<Record<HomeProfile, Partial<ProfileFormValues>>> = {
  "experienced-mother": {
    mentorBio: "Gosto de acolher mães que estão vivendo os primeiros meses com o bebê.",
    motherhoodExperience: "Mãe há 5 anos",
  },
  "future-mother": {
    interests: "Conteúdos sobre preparo emocional, rede de apoio e planejamento.",
    journeyMoment: "Planejando a maternidade",
  },
  "health-professional": {
    registrationNumber: "123456",
    specialty: "Pediatria",
    state: "CE",
  },
  "recent-mother": {
    babyBirthDate: "10/04/2026",
    bio: "Vivendo o puerpério com apoio da Maia e da minha rede.",
  },
};

function emitProfileUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function getDefaultProfileValues(profile: HomeProfile): ProfileFormValues {
  return {
    ...defaultProfileValues,
    ...defaultValuesByProfile[profile],
  };
}

export function getStoredProfileValues(profile: HomeProfile): ProfileFormValues {
  if (typeof window === "undefined") {
    return getDefaultProfileValues(profile);
  }

  try {
    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    const parsedProfile = storedProfile
      ? (JSON.parse(storedProfile) as Partial<ProfileFormValues>)
      : {};

    return {
      ...getDefaultProfileValues(profile),
      ...parsedProfile,
    };
  } catch {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return getDefaultProfileValues(profile);
  }
}

export function saveProfileValues(values: ProfileFormValues) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(values));
  emitProfileUpdated();
}

export function saveRegisteredUserProfile(data: RegisterFormData) {
  if (typeof window === "undefined") {
    return;
  }

  const currentValues = getStoredProfileValues("recent-mother");

  saveProfileValues({
    ...currentValues,
    birthDate: data.birthDate,
    email: data.email,
    fullName: data.name,
    password: data.password,
    phone: data.phone,
  });
}

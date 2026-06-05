import type { LucideIcon } from "lucide-react";
import type { HomeProfile } from "@/features/home/types";

export type ProfileFieldType = "date" | "email" | "password" | "select" | "tel" | "text" | "textarea" | "url";

export type ProfileField = {
  id: string;
  icon: LucideIcon;
  label: string;
  placeholder: string;
  type: ProfileFieldType;
  value?: string;
};

export type ProfileFormValues = {
  avatarUrl: string;
  babyBirthDate: string;
  bio: string;
  birthDate: string;
  council: string;
  email: string;
  fullName: string;
  interests: string;
  journeyMoment: string;
  mentorBio: string;
  motherhoodExperience: string;
  password: string;
  phone: string;
  registrationNumber: string;
  specialty: string;
  state: string;
};

export type ProfileContent = {
  badge?: string;
  fields: ProfileField[];
  intro: string;
  profile: HomeProfile;
  title: string;
};

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import type { HomeProfile } from "@/features/home/types";
import { NotificationSettingsCard } from "@/features/notifications/components/NotificationSettingsCard";
import { getStoredNotificationPreferences } from "@/features/notifications/data/notification-preferences";
import { profileContentByProfile } from "@/features/profile/data/profile-content";
import {
  saveAuthenticatedUserProfile,
  saveProfileValues,
} from "@/features/profile/data/profile-storage";
import { ProfileFieldControl } from "@/features/profile/components/ProfileFieldControl";
import {
  useStoredProfileValues,
  useStoredUserProfile,
} from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import type { ProfileFormValues } from "@/features/profile/types";
import { ProfessionalSelectField } from "@/features/usertypeselection/health-professional/components/ProfessionalSelectField";
import {
  professionalCouncilOptions,
  professionalSpecialtyOptions,
  professionalStateOptions,
  type ProfessionalOption,
} from "@/features/usertypeselection/health-professional/data/professional-options";
import type { AuthenticatedUser } from "@/types/user";

type ProfilePageProps = {
  initialUser?: AuthenticatedUser | null;
  profile: HomeProfile;
};

type ProfessionalProfileSelectId = "council" | "specialty" | "state";

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

function getOptionValue(options: ProfessionalOption[], value: string, fallback = "") {
  return options.find((option) => option.value === value || option.label === value)?.value ?? fallback;
}

function getSpecialtySelectValue(specialty: string) {
  if (!specialty) {
    return "";
  }

  return getOptionValue(professionalSpecialtyOptions, specialty, "other");
}

function getSpecialtyLabel(value: string, customSpecialty: string) {
  if (value === "other") {
    return customSpecialty.trim();
  }

  return professionalSpecialtyOptions.find((option) => option.value === value)?.label ?? "";
}

function getProfessionalProfileBadge(status: string) {
  if (status === "verified") {
    return "Profissional verificada";
  }

  if (status === "rejected") {
    return "Profissional não verificada";
  }

  return "Aguardando análise";
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

function splitTextList(value: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfilePage({ initialUser = null, profile }: ProfilePageProps) {
  const content = profileContentByProfile[profile];
  const values = useStoredProfileValues(profile);
  const storedUser = useStoredUserProfile(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [openProfessionalSelectId, setOpenProfessionalSelectId] =
    useState<ProfessionalProfileSelectId | null>(null);
  const [professionalSelectDrafts, setProfessionalSelectDrafts] = useState<
    Partial<Record<ProfessionalProfileSelectId, string>>
  >({});
  const [customSpecialtyDraft, setCustomSpecialtyDraft] = useState<string | null>(null);
  const firstName = values.fullName.split(" ")[0] ?? "Maia";
  const storedSpecialtySelectValue = getSpecialtySelectValue(values.specialty);
  const selectedCouncil =
    professionalSelectDrafts.council ??
    getOptionValue(professionalCouncilOptions, values.council, "CRM");
  const selectedState =
    professionalSelectDrafts.state ?? getOptionValue(professionalStateOptions, values.state);
  const selectedSpecialty = professionalSelectDrafts.specialty ?? storedSpecialtySelectValue;
  const customSpecialty =
    customSpecialtyDraft ?? (storedSpecialtySelectValue === "other" ? values.specialty : "");
  const profileBadge =
    profile === "health-professional"
      ? getProfessionalProfileBadge(storedUser.professionalVerificationStatus)
      : content.badge;

  useEffect(() => {
    saveAuthenticatedUserProfile(initialUser);
  }, [initialUser]);

  function updateValue(fieldId: keyof ProfileFormValues, value: string) {
    saveProfileValues(
      {
        ...values,
        [fieldId]: value,
      },
      profile
    );
    setIsSaved(false);
    setSaveError("");
  }

  function handleProfessionalSelectOpenChange(
    selectId: ProfessionalProfileSelectId,
    isOpen: boolean
  ) {
    setOpenProfessionalSelectId(isOpen ? selectId : null);
  }

  function updateProfessionalSelectValue(fieldId: ProfessionalProfileSelectId, value: string) {
    setProfessionalSelectDrafts((currentDrafts) => ({
      ...currentDrafts,
      [fieldId]: value,
    }));

    if (fieldId === "council" || fieldId === "state") {
      updateValue(fieldId, value);
      return;
    }

    if (value !== "other") {
      setCustomSpecialtyDraft(null);
      updateValue("specialty", getSpecialtyLabel(value, ""));
      return;
    }

    updateValue("specialty", customSpecialty);
  }

  function updateCustomSpecialty(value: string) {
    setCustomSpecialtyDraft(value);
    updateValue("specialty", value);
  }

  function renderProfessionalField(fieldId: ProfessionalProfileSelectId) {
    if (fieldId === "council") {
      return (
        <ProfessionalSelectField
          id="profile-council"
          isOpen={openProfessionalSelectId === "council"}
          label="Conselho profissional"
          onChange={(value) => updateProfessionalSelectValue("council", value)}
          onOpenChange={(isOpen) => handleProfessionalSelectOpenChange("council", isOpen)}
          options={professionalCouncilOptions}
          triggerClassName="bg-neutral/75"
          value={selectedCouncil}
        />
      );
    }

    if (fieldId === "state") {
      return (
        <ProfessionalSelectField
          id="profile-state"
          isOpen={openProfessionalSelectId === "state"}
          label="Estado (UF)"
          onChange={(value) => updateProfessionalSelectValue("state", value)}
          onOpenChange={(isOpen) => handleProfessionalSelectOpenChange("state", isOpen)}
          options={professionalStateOptions}
          triggerClassName="bg-neutral/75"
          value={selectedState}
        />
      );
    }

    return (
      <div className="grid gap-4">
        <ProfessionalSelectField
          id="profile-specialty"
          isOpen={openProfessionalSelectId === "specialty"}
          label="Especialidade"
          onChange={(value) => updateProfessionalSelectValue("specialty", value)}
          onOpenChange={(isOpen) => handleProfessionalSelectOpenChange("specialty", isOpen)}
          options={professionalSpecialtyOptions}
          triggerClassName="bg-neutral/75"
          value={selectedSpecialty}
        />

        {selectedSpecialty === "other" ? (
          <label className="block" htmlFor="profile-custom-specialty">
            <span className="block px-2 text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-title/75">
              Especialidade personalizada
            </span>
            <input
              className="mt-3 w-full rounded-full border-0 bg-neutral/75 px-5 py-4 text-base font-medium text-title outline-none ring-1 ring-transparent transition placeholder:text-text/40 focus:bg-white focus:ring-primary/35"
              id="profile-custom-specialty"
              onChange={(event) => updateCustomSpecialty(event.target.value)}
              placeholder="Ex.: consultoria em amamentação"
              type="text"
              value={customSpecialty}
            />
          </label>
        ) : null}
      </div>
    );
  }

  async function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarError("");
    setIsSaved(false);

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarError("Envie apenas fotos em JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError("A foto deve ter no maximo 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("image", file);

    setIsUploadingAvatar(true);

    const response = await fetch("/api/users/me/avatar", {
      body: formData,
      method: "POST",
    });
    const result = (await response.json().catch(() => ({}))) as {
      avatarUrl?: string;
      erro?: string;
      user?: unknown;
    };

    setIsUploadingAvatar(false);
    event.target.value = "";

    if (!response.ok || !result.avatarUrl) {
      setAvatarError(result.erro ?? "Nao foi possivel salvar sua foto agora.");
      return;
    }

    updateValue("avatarUrl", result.avatarUrl);
    saveAuthenticatedUserProfile(result.user);
    setIsSaved(true);
  }

  function buildProfilePayload() {
    const notificationPreferences = getStoredNotificationPreferences();
    const payload = {
      avatarUrl: values.avatarUrl || undefined,
      birthDate: parseProfileDate(values.birthDate),
      fullName: values.fullName,
      notificationSummary: {
        ...storedUser.notificationSummary,
        dailyCheckInEnabled: notificationPreferences.dailyCheckInEnabled,
        pushEnabled: notificationPreferences.dailyCheckInEnabled,
        timezone: storedUser.notificationSummary.timezone || "America/Fortaleza",
      },
      phone: values.phone,
      privacy: storedUser.privacy,
    };

    if (profile === "recent-mother") {
      return {
        ...payload,
        recentMother: {
          ...(storedUser.recentMother ?? {}),
          babyBirthDate: parseProfileDate(values.babyBirthDate),
          bio: values.bio.trim(),
        },
      };
    }

    if (profile === "future-mother") {
      return {
        ...payload,
        futureMother: {
          ...(storedUser.futureMother ?? {}),
          interests: splitTextList(values.interests),
          journeyMoment: values.journeyMoment.trim(),
        },
      };
    }

    if (profile === "experienced-mother") {
      return {
        ...payload,
        mentor: {
          ...(storedUser.mentor ?? {
            availableForSupport: true,
            supportTopics: [],
          }),
          mentorBio: values.mentorBio.trim(),
          motherhoodExperience: values.motherhoodExperience.trim(),
        },
      };
    }

    if (profile === "health-professional") {
      return {
        ...payload,
        professional: {
          ...(storedUser.professional ?? {}),
          council: values.council.trim(),
          registrationNumber: values.registrationNumber.trim(),
          specialty: values.specialty.trim(),
          state: values.state.trim(),
        },
      };
    }

    return payload;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setSaveError("");

    const response = await fetch("/api/users/me", {
      body: JSON.stringify(buildProfilePayload()),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    });
    const result = (await response.json().catch(() => ({}))) as {
      erro?: string;
      user?: unknown;
    };

    setIsSaving(false);

    if (!response.ok) {
      setSaveError(result.erro ?? "Nao foi possivel salvar seu perfil agora.");
      return;
    }

    saveAuthenticatedUserProfile(result.user);
    setIsSaved(true);
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[56rem] md:overflow-visible md:px-8 md:pb-32">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <Link
            className="inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            href={getProfileScopedHref("/home", profile)}
          >
            <MaiaBrand imageClassName="size-14" imageSize={58} />
          </Link>

          <div
            aria-label={`Perfil de ${firstName}`}
            className="size-[3.25rem] rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            role="img"
            style={values.avatarUrl ? { backgroundImage: `url(${values.avatarUrl})` } : undefined}
          />
        </header>

        <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10">
          <section aria-labelledby="profile-title">
            {profileBadge ? (
              <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                {profileBadge}
              </p>
            ) : null}

            <h1
              className="mt-7 max-w-[20rem] font-title text-[2.55rem] font-extrabold leading-[1.05] text-title md:mt-0 md:text-[3rem]"
              id="profile-title"
            >
              Meu <span className="text-primary">perfil</span>
            </h1>
            <p className="mt-8 max-w-[20rem] text-[1.18rem] leading-9 text-text md:text-xl md:leading-10">
              {content.intro}
            </p>
          </section>

          <div className="md:mt-0">
            <form
              className="mt-9 rounded-[2.75rem] bg-white px-8 py-8 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/55 md:mt-0 md:px-10 md:py-10"
              onSubmit={handleSubmit}
            >
              <label className="mb-7 block" htmlFor="profile-avatarFile">
                <span className="block px-2 text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-title/75">
                  Foto de perfil
                </span>
                <span className="mt-3 flex items-center gap-4 rounded-[1.5rem] bg-neutral/75 px-4 py-4">
                  <span
                    aria-label={`Foto de perfil de ${firstName}`}
                    className="grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-lg font-extrabold text-primary"
                    role="img"
                    style={
                      values.avatarUrl ? { backgroundImage: `url(${values.avatarUrl})` } : undefined
                    }
                  >
                    {values.avatarUrl ? null : firstName.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:bg-primary/10">
                      <Camera aria-hidden size={18} strokeWidth={2.3} />
                      Escolher foto
                    </span>
                    <span className="mt-2 block truncate px-2 text-xs font-semibold text-text/70">
                      {isUploadingAvatar
                        ? "Enviando foto..."
                        : values.avatarUrl
                          ? "Foto salva com seguranca"
                          : "Use uma foto JPG, PNG ou WebP"}
                    </span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      id="profile-avatarFile"
                      onChange={handleAvatarFileChange}
                      type="file"
                    />
                  </span>
                </span>
                {avatarError ? (
                  <span className="mt-3 block rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold leading-6 text-primary">
                    {avatarError}
                  </span>
                ) : null}
              </label>

              <div className="grid gap-6">
                {content.fields.map((field) => {
                  const isProfessionalSelectField =
                    profile === "health-professional" &&
                    (field.id === "council" || field.id === "state" || field.id === "specialty");

                  return isProfessionalSelectField ? (
                    <div key={field.id}>
                      {renderProfessionalField(field.id as ProfessionalProfileSelectId)}
                    </div>
                  ) : (
                    <ProfileFieldControl
                      field={field}
                      key={field.id}
                      onChange={updateValue}
                      value={values[field.id as keyof ProfileFormValues] ?? ""}
                    />
                  );
                })}
              </div>

              <button
                className="mt-9 flex h-16 w-full items-center justify-center rounded-full bg-primary px-6 font-title text-lg font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>

              {isSaved ? (
                <p className="mt-5 flex items-center justify-center gap-2 text-sm font-extrabold text-primary">
                  <CheckCircle2 aria-hidden size={17} strokeWidth={2.4} />
                  Perfil atualizado
                </p>
              ) : null}

              {saveError ? (
                <p className="mt-5 rounded-2xl bg-primary/10 px-4 py-3 text-center text-sm font-bold leading-6 text-primary">
                  {saveError}
                </p>
              ) : null}
            </form>

            <NotificationSettingsCard />
          </div>
        </div>
      </div>
      <BottomNavigation profile={profile} />
    </main>
  );
}

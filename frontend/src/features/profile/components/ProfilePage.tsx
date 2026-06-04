"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import type { HomeProfile } from "@/features/home/types";
import { NotificationSettingsCard } from "@/features/notifications/components/NotificationSettingsCard";
import { profileContentByProfile } from "@/features/profile/data/profile-content";
import { saveProfileValues } from "@/features/profile/data/profile-storage";
import { ProfileFieldControl } from "@/features/profile/components/ProfileFieldControl";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import type { ProfileFormValues } from "@/features/profile/types";

type ProfilePageProps = {
  profile: HomeProfile;
};

export function ProfilePage({ profile }: ProfilePageProps) {
  const content = profileContentByProfile[profile];
  const values = useStoredProfileValues(profile);
  const [isSaved, setIsSaved] = useState(false);
  const firstName = values.fullName.split(" ")[0] ?? "Maia";

  function updateValue(fieldId: keyof ProfileFormValues, value: string) {
    saveProfileValues(
      {
        ...values,
        [fieldId]: value,
      },
      profile
    );
    setIsSaved(false);
  }

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        return;
      }

      updateValue("avatarUrl", reader.result);
    });
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
            {content.badge ? (
              <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                {content.badge}
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
                      {values.avatarUrl.startsWith("data:")
                        ? "Imagem selecionada"
                        : "Use uma foto do celular"}
                    </span>
                    <input
                      accept="image/*"
                      className="sr-only"
                      id="profile-avatarFile"
                      onChange={handleAvatarFileChange}
                      type="file"
                    />
                  </span>
                </span>
              </label>

              <div className="grid gap-6">
                {content.fields.map((field) => (
                  <ProfileFieldControl
                    field={field}
                    key={field.id}
                    onChange={updateValue}
                    value={values[field.id as keyof ProfileFormValues] ?? ""}
                  />
                ))}
              </div>

              <button
                className="mt-9 flex h-16 w-full items-center justify-center rounded-full bg-primary px-6 font-title text-lg font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                type="submit"
              >
                Salvar
              </button>

              {isSaved ? (
                <p className="mt-5 flex items-center justify-center gap-2 text-sm font-extrabold text-primary">
                  <CheckCircle2 aria-hidden size={17} strokeWidth={2.4} />
                  Perfil atualizado localmente
                </p>
              ) : null}
            </form>

            <NotificationSettingsCard />
          </div>
        </div>
      </div>
      <BottomNavigation />
    </main>
  );
}

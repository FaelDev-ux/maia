"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import logoMaia from "@/../public/images/logo-maia.png";
import type { HomeProfile } from "@/features/home/types";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";

type ContentHeaderProps = {
  backHref?: string;
  backLabel?: string;
  profile: HomeProfile;
};

export function ContentHeader({ backHref, backLabel = "Voltar", profile }: ContentHeaderProps) {
  const storedProfile = useStoredProfileValues(profile);
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";

  return (
    <header className="flex h-[4.4rem] items-center justify-between bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
      {backHref ? (
        <Link
          aria-label={backLabel}
          className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href={getProfileScopedHref(backHref, profile)}
        >
          <ArrowLeft aria-hidden size={21} strokeWidth={2.4} />
        </Link>
      ) : null}

      <Image
        src={logoMaia}
        alt="Maia"
        width={58}
        height={58}
        className="size-14 object-contain"
        priority
      />
      <div
        aria-label={`Perfil de ${firstName}`}
        className="size-[3.25rem] rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
        role="img"
        style={storedProfile.avatarUrl ? { backgroundImage: `url(${storedProfile.avatarUrl})` } : undefined}
      />
    </header>
  );
}

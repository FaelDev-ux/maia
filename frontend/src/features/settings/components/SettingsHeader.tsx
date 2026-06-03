import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import logoMaia from "@/../public/images/logo-maia.png";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import type { HomeProfile } from "@/features/home/types";

type SettingsHeaderProps = {
  backHref?: string;
  profile: HomeProfile;
};

export function SettingsHeader({ backHref = "/mais", profile }: SettingsHeaderProps) {
  const storedProfile = useStoredProfileValues(profile);
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";

  return (
    <header className="flex h-[4.4rem] items-center justify-between bg-white px-6 md:mt-6 md:h-20 md:rounded-[2rem] md:px-8 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
      <Link
        aria-label="Voltar"
        className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        href={getProfileScopedHref(backHref, profile)}
      >
        <ArrowLeft aria-hidden size={21} strokeWidth={2.4} />
      </Link>

      <Image
        src={logoMaia}
        alt="Maia"
        width={54}
        height={54}
        className="size-13 object-contain"
        priority
      />

      <Link
        aria-label={`Perfil de ${firstName}`}
        className="size-11 rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
        href={getProfileScopedHref("/perfil", profile)}
        style={
          storedProfile.avatarUrl ? { backgroundImage: `url(${storedProfile.avatarUrl})` } : undefined
        }
        title={`Perfil de ${firstName}`}
      />
    </header>
  );
}

import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type ProfileRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function ProfileRoute({ searchParams }: ProfileRouteProps) {
  const params = await searchParams;
  const profile = resolveProfile(params?.profile);

  return <ProfilePage key={profile} profile={profile} />;
}

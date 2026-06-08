import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type ProfileRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function ProfileRoute({ searchParams }: ProfileRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();
  const profile = resolveRouteProfile(params?.profile, user);

  return <ProfilePage initialUser={user} key={profile} profile={profile} />;
}

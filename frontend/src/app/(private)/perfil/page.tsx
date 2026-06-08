import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

export default async function ProfileRoute() {
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.app);
  const profile = resolveUserProfile(user);

  return <ProfilePage initialUser={user} key={profile} profile={profile} />;
}

import { MorePage } from "@/features/settings/components/MorePage";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

export default async function MoreRoute() {
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.app);

  return <MorePage profile={resolveUserProfile(user)} />;
}

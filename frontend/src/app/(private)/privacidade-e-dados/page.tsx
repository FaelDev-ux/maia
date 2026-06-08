import { PrivacyDataPage } from "@/features/settings/components/PrivacyDataPage";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

export default async function PrivacyDataRoute() {
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.app);

  return <PrivacyDataPage profile={resolveUserProfile(user)} />;
}

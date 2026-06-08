import { HelpSupportPage } from "@/features/settings/components/HelpSupportPage";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

export default async function HelpSupportRoute() {
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.app);

  return <HelpSupportPage profile={resolveUserProfile(user)} />;
}

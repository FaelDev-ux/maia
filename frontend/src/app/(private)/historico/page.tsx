import { CheckInHistoryPage } from "@/features/check-in/components/CheckInHistoryPage";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

export default async function HistoryRoute() {
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.checkIn);

  return <CheckInHistoryPage profile={resolveUserProfile(user)} />;
}

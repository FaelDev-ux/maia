import { DailyCheckInPage } from "@/features/check-in/components/DailyCheckInPage";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type CheckInRouteProps = {
  searchParams?: Promise<{
    emotion?: string;
  }>;
};

export default async function CheckInRoute({ searchParams }: CheckInRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.checkIn);

  return (
    <DailyCheckInPage
      initialEmotionId={params?.emotion}
      profile={resolveUserProfile(user)}
    />
  );
}

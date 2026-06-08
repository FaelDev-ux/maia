import { DailyCheckInPage } from "@/features/check-in/components/DailyCheckInPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type CheckInRouteProps = {
  searchParams?: Promise<{
    emotion?: string;
    profile?: string;
  }>;
};

export default async function CheckInRoute({ searchParams }: CheckInRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return (
    <DailyCheckInPage
      initialEmotionId={params?.emotion}
      profile={resolveRouteProfile(params?.profile, user)}
    />
  );
}

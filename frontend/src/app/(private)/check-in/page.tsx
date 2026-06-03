import { DailyCheckInPage } from "@/features/check-in/components/DailyCheckInPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type CheckInRouteProps = {
  searchParams?: Promise<{
    emotion?: string;
    profile?: string;
  }>;
};

export default async function CheckInRoute({ searchParams }: CheckInRouteProps) {
  const params = await searchParams;

  return <DailyCheckInPage initialEmotionId={params?.emotion} profile={resolveProfile(params?.profile)} />;
}

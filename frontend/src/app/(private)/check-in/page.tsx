import { DailyCheckInPage } from "@/features/check-in/components/DailyCheckInPage";

type CheckInRouteProps = {
  searchParams?: Promise<{
    emotion?: string;
  }>;
};

export default async function CheckInRoute({ searchParams }: CheckInRouteProps) {
  const params = await searchParams;

  return <DailyCheckInPage initialEmotionId={params?.emotion} />;
}

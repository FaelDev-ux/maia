import { CheckInHistoryPage } from "@/features/check-in/components/CheckInHistoryPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type HistoryRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function HistoryRoute({ searchParams }: HistoryRouteProps) {
  const params = await searchParams;

  return <CheckInHistoryPage profile={resolveProfile(params?.profile)} />;
}

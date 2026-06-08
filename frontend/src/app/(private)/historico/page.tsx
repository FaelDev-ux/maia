import { CheckInHistoryPage } from "@/features/check-in/components/CheckInHistoryPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type HistoryRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function HistoryRoute({ searchParams }: HistoryRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <CheckInHistoryPage profile={resolveRouteProfile(params?.profile, user)} />;
}

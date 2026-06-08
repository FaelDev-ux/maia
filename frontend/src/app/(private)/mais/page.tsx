import { MorePage } from "@/features/settings/components/MorePage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type MoreRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function MoreRoute({ searchParams }: MoreRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <MorePage profile={resolveRouteProfile(params?.profile, user)} />;
}

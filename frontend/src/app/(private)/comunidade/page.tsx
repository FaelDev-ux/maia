import { CommunityPage } from "@/features/community/components/CommunityPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type CommunityRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function CommunityRoute({ searchParams }: CommunityRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <CommunityPage profile={resolveRouteProfile(params?.profile, user)} />;
}

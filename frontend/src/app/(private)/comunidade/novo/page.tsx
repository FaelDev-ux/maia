import { CommunityCreatePostPage } from "@/features/community/components/CommunityCreatePostPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type CommunityCreatePostRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function CommunityCreatePostRoute({
  searchParams,
}: CommunityCreatePostRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <CommunityCreatePostPage profile={resolveRouteProfile(params?.profile, user)} />;
}

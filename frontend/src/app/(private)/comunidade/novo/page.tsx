import { CommunityCreatePostPage } from "@/features/community/components/CommunityCreatePostPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type CommunityCreatePostRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function CommunityCreatePostRoute({
  searchParams,
}: CommunityCreatePostRouteProps) {
  const params = await searchParams;

  return <CommunityCreatePostPage profile={resolveProfile(params?.profile)} />;
}

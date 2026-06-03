import { CommunityPage } from "@/features/community/components/CommunityPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type CommunityRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function CommunityRoute({ searchParams }: CommunityRouteProps) {
  const params = await searchParams;

  return <CommunityPage profile={resolveProfile(params?.profile)} />;
}

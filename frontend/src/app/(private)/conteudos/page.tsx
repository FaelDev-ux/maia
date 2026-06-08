import { ContentsPage } from "@/features/contents/components/ContentsPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type ContentsRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function ContentsRoute({ searchParams }: ContentsRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <ContentsPage profile={resolveRouteProfile(params?.profile, user)} />;
}

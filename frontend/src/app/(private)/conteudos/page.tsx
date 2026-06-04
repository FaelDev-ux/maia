import { ContentsPage } from "@/features/contents/components/ContentsPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type ContentsRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function ContentsRoute({ searchParams }: ContentsRouteProps) {
  const params = await searchParams;

  return <ContentsPage profile={resolveProfile(params?.profile)} />;
}

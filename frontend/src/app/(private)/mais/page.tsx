import { MorePage } from "@/features/settings/components/MorePage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type MoreRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function MoreRoute({ searchParams }: MoreRouteProps) {
  const params = await searchParams;

  return <MorePage profile={resolveProfile(params?.profile)} />;
}

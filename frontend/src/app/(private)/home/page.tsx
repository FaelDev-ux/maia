import { HomePage } from "@/features/home/components/HomePage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type HomeRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function HomeRoute({ searchParams }: HomeRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <HomePage profile={resolveRouteProfile(params?.profile, user)} />;
}

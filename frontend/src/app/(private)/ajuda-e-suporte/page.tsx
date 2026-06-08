import { HelpSupportPage } from "@/features/settings/components/HelpSupportPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type HelpSupportRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function HelpSupportRoute({ searchParams }: HelpSupportRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <HelpSupportPage profile={resolveRouteProfile(params?.profile, user)} />;
}

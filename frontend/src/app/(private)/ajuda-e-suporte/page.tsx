import { HelpSupportPage } from "@/features/settings/components/HelpSupportPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type HelpSupportRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function HelpSupportRoute({ searchParams }: HelpSupportRouteProps) {
  const params = await searchParams;

  return <HelpSupportPage profile={resolveProfile(params?.profile)} />;
}

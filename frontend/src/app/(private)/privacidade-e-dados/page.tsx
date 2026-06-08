import { PrivacyDataPage } from "@/features/settings/components/PrivacyDataPage";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type PrivacyDataRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function PrivacyDataRoute({ searchParams }: PrivacyDataRouteProps) {
  const params = await searchParams;
  const user = await getServerAuthenticatedUser();

  return <PrivacyDataPage profile={resolveRouteProfile(params?.profile, user)} />;
}

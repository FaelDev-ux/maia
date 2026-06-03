import { PrivacyDataPage } from "@/features/settings/components/PrivacyDataPage";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type PrivacyDataRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function PrivacyDataRoute({ searchParams }: PrivacyDataRouteProps) {
  const params = await searchParams;

  return <PrivacyDataPage profile={resolveProfile(params?.profile)} />;
}

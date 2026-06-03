import { HomePage } from "@/features/home/components/HomePage";
import type { HomeProfile } from "@/features/home/types";

type HomeRouteProps = {
  searchParams?: Promise<{
    profile?: string;
  }>;
};

function resolveHomeProfile(profile?: string): HomeProfile {
  if (profile === "health-professional") {
    return "health-professional";
  }

  if (profile === "experienced-mother") {
    return "experienced-mother";
  }

  if (profile === "future-mother") {
    return "future-mother";
  }

  return "recent-mother";
}

export default async function HomeRoute({ searchParams }: HomeRouteProps) {
  const params = await searchParams;

  return <HomePage profile={resolveHomeProfile(params?.profile)} />;
}

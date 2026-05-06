import { UnifiedAuthPage, type AuthMode } from "@/features/auth/components/UnifiedAuthPage";

type AuthPageProps = {
  searchParams: Promise<{
    intro?: string;
    mode?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const initialMode: AuthMode = params.mode === "register" ? "register" : "login";
  const shouldShowSignupIntro = params.intro === "1";

  return (
    <UnifiedAuthPage initialMode={initialMode} shouldShowSignupIntro={shouldShowSignupIntro} />
  );
}

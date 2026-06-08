import { redirect } from "next/navigation";
import { RegistrationDraftProvider } from "@/features/signup/components/RegistrationDraftProvider";
import { getServerAuthenticatedUser } from "@/services/api/session";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const user = await getServerAuthenticatedUser();

  if (user) {
    redirect("/home");
  }

  return <RegistrationDraftProvider>{children}</RegistrationDraftProvider>;
}

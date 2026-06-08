import { redirect } from "next/navigation";
import { getServerAuthenticatedUser } from "@/services/api/session";

type PrivateLayoutProps = {
  children: React.ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = await getServerAuthenticatedUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  return children;
}

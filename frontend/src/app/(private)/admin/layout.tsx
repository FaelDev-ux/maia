import { redirect } from "next/navigation";
import { getServerAuthenticatedUser } from "@/services/api/session";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getServerAuthenticatedUser();

  if (!user?.roles.includes("ADM")) {
    redirect("/home");
  }

  return children;
}

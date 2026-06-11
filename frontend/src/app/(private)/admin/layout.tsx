import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { getServerAuthenticatedUser } from "@/services/api/session";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getServerAuthenticatedUser();

  requireRouteRoles(user, appRouteAccess.admin);

  return children;
}

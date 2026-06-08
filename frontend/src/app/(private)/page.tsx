import { redirect } from "next/navigation";
import { getDefaultAuthorizedRoute } from "@/features/auth/route-access";
import { getServerAuthenticatedUser } from "@/services/api/session";

export default async function PrivatePage() {
  const user = await getServerAuthenticatedUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  redirect(getDefaultAuthorizedRoute(user));
}

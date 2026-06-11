import { redirect } from "next/navigation";
import { AuthSessionProvider } from "@/features/auth/session-store";
import {
  getServerAuthenticatedUser,
  getServerNotificationPreferences,
} from "@/services/api/session";

type PrivateLayoutProps = {
  children: React.ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = await getServerAuthenticatedUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const notificationPreferences = await getServerNotificationPreferences();

  return (
    <AuthSessionProvider
      initialNotificationPreferences={notificationPreferences}
      initialUser={user}
    >
      {children}
    </AuthSessionProvider>
  );
}

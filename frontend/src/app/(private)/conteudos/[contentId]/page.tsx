import { notFound } from "next/navigation";
import { ContentArticlePage } from "@/features/contents/components/ContentArticlePage";
import { normalizeContent } from "@/features/contents/services";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { backendFetch } from "@/services/api/server";
import { getServerAuthenticatedUser } from "@/services/api/session";

type ContentArticleRouteProps = {
  params: Promise<{
    contentId: string;
  }>;
};

export default async function ContentArticleRoute({ params }: ContentArticleRouteProps) {
  const { contentId } = await params;
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.app);
  const response = await backendFetch(`/api/contents/${contentId}/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const data = (await response.json().catch(() => ({}))) as { content?: unknown };

  if (!data.content || typeof data.content !== "object") {
    notFound();
  }

  const article = normalizeContent(data.content);

  return <ContentArticlePage article={article} profile={resolveUserProfile(user)} />;
}

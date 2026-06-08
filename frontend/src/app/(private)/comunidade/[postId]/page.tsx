import { CommunityPostDetailPage } from "@/features/community/components/CommunityPostDetailPage";
import { communityPosts } from "@/features/community/data/community-posts";
import { appRouteAccess, requireRouteRoles } from "@/features/auth/route-access";
import { resolveUserProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type CommunityPostRouteProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function CommunityPostRoute({ params }: CommunityPostRouteProps) {
  const { postId } = await params;
  const user = await getServerAuthenticatedUser();
  requireRouteRoles(user, appRouteAccess.app);
  const post = communityPosts.find((currentPost) => currentPost.id === postId);

  return (
    <CommunityPostDetailPage
      initialPost={post}
      postId={postId}
      profile={resolveUserProfile(user)}
    />
  );
}

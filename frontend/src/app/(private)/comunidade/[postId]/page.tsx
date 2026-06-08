import { CommunityPostDetailPage } from "@/features/community/components/CommunityPostDetailPage";
import { communityPosts } from "@/features/community/data/community-posts";
import { resolveRouteProfile } from "@/features/profile/utils/profile-routing";
import { getServerAuthenticatedUser } from "@/services/api/session";

type CommunityPostRouteProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export default async function CommunityPostRoute({ params, searchParams }: CommunityPostRouteProps) {
  const { postId } = await params;
  const resolvedSearchParams = await searchParams;
  const user = await getServerAuthenticatedUser();
  const post = communityPosts.find((currentPost) => currentPost.id === postId);

  return (
    <CommunityPostDetailPage
      initialPost={post}
      postId={postId}
      profile={resolveRouteProfile(resolvedSearchParams?.profile, user)}
    />
  );
}

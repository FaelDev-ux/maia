import { CommunityPostDetailPage } from "@/features/community/components/CommunityPostDetailPage";
import { communityPosts } from "@/features/community/data/community-posts";

type CommunityPostRouteProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function CommunityPostRoute({ params }: CommunityPostRouteProps) {
  const { postId } = await params;
  const post = communityPosts.find((currentPost) => currentPost.id === postId);

  return <CommunityPostDetailPage initialPost={post} postId={postId} />;
}

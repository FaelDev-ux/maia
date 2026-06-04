import { communityPosts } from "@/features/community/data/community-posts";
import {
  COMMUNITY_CREATED_POSTS_UPDATED_EVENT,
  COMMUNITY_REMOVED_POSTS_UPDATED_EVENT,
  getStoredCreatedCommunityPosts,
  getStoredRemovedPostIds,
  saveStoredRemovedPostIds,
} from "@/features/community/data/community-storage";
import type { CommunityPost } from "@/features/community/types";

function parseCreatedCommunityPosts() {
  const fixedPostIds = new Set(communityPosts.map((post) => post.id));

  return getStoredCreatedCommunityPosts().filter((post) => !fixedPostIds.has(post.id));
}

function sortPostsByMockRecency(posts: CommunityPost[]) {
  return [...posts].sort((firstPost, secondPost) => {
    const firstIsCreated = firstPost.id.startsWith("mock-post-");
    const secondIsCreated = secondPost.id.startsWith("mock-post-");

    if (firstIsCreated !== secondIsCreated) {
      return firstIsCreated ? -1 : 1;
    }

    return (
      secondPost.supportCount +
      secondPost.repliesCount -
      firstPost.supportCount -
      firstPost.repliesCount
    );
  });
}

export function getAdminCommunityPosts() {
  const removedPostIds = new Set(getStoredRemovedPostIds());

  return sortPostsByMockRecency([...parseCreatedCommunityPosts(), ...communityPosts]).filter(
    (post) => !removedPostIds.has(post.id)
  );
}

export function getAdminCommunityPostsSnapshot() {
  return JSON.stringify(getAdminCommunityPosts());
}

export function getAdminCommunityPostsServerSnapshot() {
  return JSON.stringify(communityPosts);
}

export function removeCommunityPost(postId: string) {
  const removedPostIds = new Set(getStoredRemovedPostIds());

  removedPostIds.add(postId);
  saveStoredRemovedPostIds(Array.from(removedPostIds));
}

export function subscribeToAdminCommunityPosts(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COMMUNITY_CREATED_POSTS_UPDATED_EVENT, onStoreChange);
  window.addEventListener(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COMMUNITY_CREATED_POSTS_UPDATED_EVENT, onStoreChange);
    window.removeEventListener(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT, onStoreChange);
  };
}

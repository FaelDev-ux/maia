import { communityPosts } from "@/features/community/data/community-posts";
import {
  COMMUNITY_CREATED_POSTS_STORAGE_KEY,
  COMMUNITY_REMOVED_POSTS_UPDATED_EVENT,
  getStoredRemovedPostIds,
  saveStoredRemovedPostIds,
} from "@/features/community/data/community-storage";
import type { CommunityPost } from "@/features/community/types";

function parseCreatedCommunityPosts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedPosts = window.localStorage.getItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);
    const parsedPosts = storedPosts ? (JSON.parse(storedPosts) as unknown) : [];
    const fixedPostIds = new Set(communityPosts.map((post) => post.id));

    return Array.isArray(parsedPosts)
      ? (parsedPosts as CommunityPost[]).filter(
          (post) => typeof post.id === "string" && !fixedPostIds.has(post.id)
        )
      : [];
  } catch {
    window.localStorage.removeItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);
    return [];
  }
}

function sortPostsByMockRecency(posts: CommunityPost[]) {
  return [...posts].sort((firstPost, secondPost) => {
    const firstIsCreated = firstPost.id.startsWith("mock-post-");
    const secondIsCreated = secondPost.id.startsWith("mock-post-");

    if (firstIsCreated !== secondIsCreated) {
      return firstIsCreated ? -1 : 1;
    }

    return secondPost.supportCount + secondPost.repliesCount - firstPost.supportCount - firstPost.repliesCount;
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
  window.addEventListener(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT, onStoreChange);
  };
}

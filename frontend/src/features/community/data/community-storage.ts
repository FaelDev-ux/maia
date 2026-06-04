import type { CommunityPost } from "@/features/community/types";

export const COMMUNITY_CREATED_POSTS_STORAGE_KEY = "maia-community-created-posts";
export const COMMUNITY_CREATED_POSTS_UPDATED_EVENT = "maia-community-created-posts-updated";
export const COMMUNITY_REMOVED_POSTS_STORAGE_KEY = "maia-community-removed-posts";
export const COMMUNITY_REMOVED_POSTS_UPDATED_EVENT = "maia-community-removed-posts-updated";
export const COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY = "maia-community-supported-posts";
export const COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT = "maia-community-supported-posts-updated";

function emitSupportedPostsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT));
}

function emitCreatedPostsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COMMUNITY_CREATED_POSTS_UPDATED_EVENT));
}

function emitRemovedPostsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COMMUNITY_REMOVED_POSTS_UPDATED_EVENT));
}

export function getStoredCreatedCommunityPosts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedPosts = window.localStorage.getItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);

    if (!storedPosts) {
      return [];
    }

    const parsedPosts = JSON.parse(storedPosts);

    return Array.isArray(parsedPosts)
      ? (parsedPosts as CommunityPost[]).filter((post) => typeof post.id === "string")
      : [];
  } catch {
    window.localStorage.removeItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY);
    return [];
  }
}

export function saveStoredCreatedCommunityPosts(posts: CommunityPost[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY, JSON.stringify(posts));
  emitCreatedPostsUpdated();
}

export function getStoredSupportedPostIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedPostIds = window.localStorage.getItem(COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY);

    if (!storedPostIds) {
      return [];
    }

    const parsedPostIds = JSON.parse(storedPostIds);

    return Array.isArray(parsedPostIds)
      ? parsedPostIds.filter((postId): postId is string => typeof postId === "string")
      : [];
  } catch {
    window.localStorage.removeItem(COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY);
    return [];
  }
}

export function saveStoredSupportedPostIds(postIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY, JSON.stringify(postIds));
  emitSupportedPostsUpdated();
}

export function getStoredRemovedPostIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedPostIds = window.localStorage.getItem(COMMUNITY_REMOVED_POSTS_STORAGE_KEY);

    if (!storedPostIds) {
      return [];
    }

    const parsedPostIds = JSON.parse(storedPostIds);

    return Array.isArray(parsedPostIds)
      ? parsedPostIds.filter((postId): postId is string => typeof postId === "string")
      : [];
  } catch {
    window.localStorage.removeItem(COMMUNITY_REMOVED_POSTS_STORAGE_KEY);
    return [];
  }
}

export function saveStoredRemovedPostIds(postIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMUNITY_REMOVED_POSTS_STORAGE_KEY, JSON.stringify(postIds));
  emitRemovedPostsUpdated();
}

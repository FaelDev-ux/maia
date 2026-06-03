export const COMMUNITY_CREATED_POSTS_STORAGE_KEY = "maia-community-created-posts";
export const COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY = "maia-community-supported-posts";
export const COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT = "maia-community-supported-posts-updated";

function emitSupportedPostsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT));
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

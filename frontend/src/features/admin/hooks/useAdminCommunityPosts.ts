"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getAdminCommunityPostsServerSnapshot,
  getAdminCommunityPostsSnapshot,
  subscribeToAdminCommunityPosts,
} from "@/features/admin/data/community-moderation";
import type { CommunityPost } from "@/features/community/types";

function parseCommunityPosts(snapshot: string) {
  try {
    const parsedPosts = JSON.parse(snapshot) as unknown;

    return Array.isArray(parsedPosts) ? (parsedPosts as CommunityPost[]) : [];
  } catch {
    return [];
  }
}

export function useAdminCommunityPosts() {
  const postsSnapshot = useSyncExternalStore(
    subscribeToAdminCommunityPosts,
    getAdminCommunityPostsSnapshot,
    getAdminCommunityPostsServerSnapshot
  );

  return useMemo(() => parseCommunityPosts(postsSnapshot), [postsSnapshot]);
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdminCommunityPosts } from "@/features/admin/services";
import type { CommunityPost } from "@/features/community/types";

export function useAdminCommunityPosts() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setPosts(await fetchAdminCommunityPosts());
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Nao foi possivel carregar posts para moderacao."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  return { error, isLoading, posts, reload };
}

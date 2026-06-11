"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCommunityPosts } from "@/features/community/services";
import type { CommunityPost } from "@/features/community/types";

export function useCommunityPosts() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setPosts(await fetchCommunityPosts());
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Nao foi possivel carregar a comunidade."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  return { error, isLoading, posts, reload, setPosts };
}

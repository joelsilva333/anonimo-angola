import { useEffect, useState, useCallback } from "react";
import { api } from "../api/config";
import { SimilarPostInterface } from "../interfaces/similar-post";

export default function useGetSimilarPosts(postId: string) {
  const [similarPosts, setSimilarPosts] = useState<SimilarPostInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSimilar = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postId}/similar`);
      if (response.status === 200) {
        setSimilarPosts(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar relatos semelhantes:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchSimilar();
  }, [fetchSimilar]);

  return { similarPosts, loading };
}

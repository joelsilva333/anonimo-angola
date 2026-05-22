import { useState, useEffect, useCallback } from "react";
import { api } from "../api/config";
import { PostInterface } from "../interfaces/post";

export default function useGetPostById(postId: string) {
  const [post, setPost] = useState<PostInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/posts/${postId}`);
      if (response.status === 200) {
        setPost(response.data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao buscar post", err);
      setError(err?.response?.data?.message || "Desabafo não encontrado.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const refetch = async () => {
    await fetchPost();
  };

  return { post, loading, error, refetch };
}
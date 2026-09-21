import { useEffect, useState, useCallback } from "react";
import { PostInterface } from "../interfaces/post";
import { useUser } from "./user";
import { api } from "../api/config";

export function useGetUserPosts() {
  const [userPosts, setUserPosts] = useState<PostInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { user } = useUser();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/user/${user?.id}`);
      if (response.status === 200) {
        setUserPosts(response.data);
        setError(false);
      }
    } catch (error) {
      console.error("Erro ao buscar posts pelo ID do usuário:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPosts();
    }
  }, [user?.id, fetchPosts]);

  const refetch = async (options?: {
      optimisticPosts?: (prev: PostInterface[]) => PostInterface[];
    }) => {
      if (options?.optimisticPosts) {
        setUserPosts((prev) => options.optimisticPosts!(prev));
      }
      await fetchPosts();
    };

  return { userPosts, loading, error, refetch };
}

export function useGetPostsByUserId(userId?: string) {
  const [userPosts, setUserPosts] = useState<PostInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(`/posts/user/${userId}`);
      if (response.status === 200) {
        setUserPosts(response.data);
        setError(false);
      }
    } catch (error) {
      console.error("Erro ao buscar posts pelo ID do usuário:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refetch = async (options?: {
    optimisticPosts?: (prev: PostInterface[]) => PostInterface[];
  }) => {
    if (options?.optimisticPosts) {
      setUserPosts((prev) => options.optimisticPosts!(prev));
    }
    await fetchPosts();
  };

  return { userPosts, loading, error, refetch };
}

const FEED_PAGE_SIZE = 15;

/**
 * Feed principal (paginado, ordenado pelo algoritmo do backend — recência +
 * afinidade + quem segues). `loadMore()` acrescenta a próxima página;
 * `refetch()` sem opções volta à primeira página (usado depois de reagir a
 * um post, por ex.); `refetch({ optimisticPosts })` só actualiza o estado
 * local, sem ir ao servidor (usado ao criar um novo post).
 */
export function useGetPosts() {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetchPage = useCallback(async (pageToFetch: number, replace: boolean) => {
    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const response = await api.get("/posts", {
        params: { page: pageToFetch, pageSize: FEED_PAGE_SIZE },
      });
      const newPosts: PostInterface[] = response.data;
      setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === FEED_PAGE_SIZE);
      setPage(pageToFetch);
      setError(false);
    } catch (error) {
      console.error("Erro ao buscar posts", error);
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchPage(page + 1, false);
  };

  const refetch = async (options?: {
    optimisticPosts?: (prev: PostInterface[]) => PostInterface[];
  }) => {
    if (options?.optimisticPosts) {
      setPosts((prev) => options.optimisticPosts!(prev));
      return;
    }
    await fetchPage(1, true);
  };

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  return { posts, loading, loadingMore, hasMore, error, loadMore, refetch };
}

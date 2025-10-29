import { useEffect, useState, useCallback } from "react";
import { PostInterface } from "../interfaces/post";
import { useUser } from "./user";
import { api } from "../api/config";

export function useGetUserPosts() {
  const [userPosts, setUserPosts] = useState<PostInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/user/${user?.id}`);
      if (response.status === 200) {
        setUserPosts(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar posts pelo ID do usuário:", error);
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

    useEffect(() => {
      fetchPosts();
    }, [fetchPosts]);


  return { userPosts, loading, refetch };
}

export function useGetPosts() {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      if (response.status === 200) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar posts", error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (options?: {
    optimisticPosts?: (prev: PostInterface[]) => PostInterface[];
  }) => {
    if (options?.optimisticPosts) {
      setPosts((prev) => options.optimisticPosts!(prev));
    }
    await fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, refetch };
}

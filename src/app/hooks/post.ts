import { useEffect, useState } from "react";
import { PostInterface } from "../interfaces/post";
import { useUser } from "./user";
import { api } from "../api/config";

export function useGetUserPosts() {
  const [userPosts, setUserPosts] = useState<PostInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchPosts = async () => {
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
    };

    if (user?.id) {
      fetchPosts();
    }
  }, [user]);

  return { userPosts, loading };
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



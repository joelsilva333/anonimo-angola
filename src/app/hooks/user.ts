import { useCallback, useEffect, useState } from "react";
import UserInterface from "../interfaces/user";
import { api } from "../api/config";

export interface PublicProfile {
  id: string;
  anon_name: string;
  profile_picture: string;
  created_at: string;
  is_active: boolean;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setProfile(response.data);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar perfil do utilizador:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}

export function useUser() {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  return { user, loading };
}

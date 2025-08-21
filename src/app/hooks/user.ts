import { useEffect, useState } from "react";
import UserInterface from "../interfaces/user";

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

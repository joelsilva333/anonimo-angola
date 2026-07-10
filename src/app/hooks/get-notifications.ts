import { useState, useEffect } from "react";
import { api } from "../api/config";
import { NotificationInterface } from "../interfaces/notification";

export default function useGetNotifications(shouldFetch: boolean = true) {
  const [notifications, setNotifications] = useState<NotificationInterface[]>(
    [],
  );

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notification");
        if (response.status !== 200) {
          throw new Error("Falha ao buscar notificações");
        }

        const data = await response.data;
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [shouldFetch]); // Adicionado às dependências

  return { notifications };
}

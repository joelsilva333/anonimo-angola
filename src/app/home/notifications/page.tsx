"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Heart,
  Check,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/app/api/config";

interface NotificationInterface {
  id: string;
  targetId: string;
  type: "LIKE" | "COMMENT";
  isRead: boolean;
  createdAt: string;
  sender: {
    anon_name: string;
  };
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return dateString;

  if (diffInSeconds < 60) return "agora mesmo";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes}min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "ontem";
  if (diffInDays < 7) return `há ${diffInDays}d`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationInterface[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/notification");
      setNotifications(response.data);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notiId: string) => {
    try {
      await api.patch(`/notification/${notiId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notiId ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notification/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="hover:opacity-80 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold uppercase flex items-center gap-2">
            Notificações
          </h1>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-3 text-sm">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 font-semibold text-black/60 hover:text-black/80 hover:cursor-pointer transition-all duration-300 p-2 rounded-xl hover:bg-gray-300/20">
              <Check size={16} /> Marcar todas como lidas
            </button>

            <button
              onClick={clearAll}
              className="flex items-center gap-1 font-semibold text-red-500 hover:text-red-600 hover:cursor-pointer transition-all duration-300 p-2 rounded-xl hover:bg-red-300/10">
              <Trash2 size={16} /> Limpar tudo
            </button>
          </div>
        )}
      </div>

      <div className="card flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-black/40">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-black/50 gap-2">
            <Bell
              size={40}
              className="stroke-[1.5]"
            />
            <p className="font-medium">
              Tudo limpo por aqui! Nenhuma notificação encontrada.
            </p>
          </div>
        ) : (
          <div className="flex flex-col division-y divide-secondary/60">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/home/post/${notification.targetId}`}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`flex items-start justify-between p-4 rounded-2xl transition gap-4 mb-2 last:mb-0 ${
                  notification.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-secondary/10 hover:bg-secondary/20"
                }`}>
                <div className="flex gap-3 items-center justify-center">
                  <div className="p-1.5 rounded-full bg-secondary/10 text-secondary shrink-0">
                    {notification.type === "LIKE" ? (
                      <Heart
                        size={18}
                        fill="currentColor"
                      />
                    ) : (
                      <MessageCircle size={18} />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-semibold truncate">
                        {notification.sender?.anon_name}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-black/80 leading-relaxed">
                      {notification.type === "LIKE"
                        ? "curtiu o seu post."
                        : "comentou no seu post."}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-black/50 whitespace-nowrap pt-1">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

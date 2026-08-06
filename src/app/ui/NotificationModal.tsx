"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Heart, ExternalLink, CheckCheck } from "lucide-react";
import Link from "next/link";
import useGetNotifications from "../hooks/get-notifications";
import { NotificationInterface } from "../interfaces/notification";
import { api } from "../api/config";

interface NotificationModalProps {
  setOpen: (open: boolean) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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

export default function NotificationModal({ setOpen }: NotificationModalProps) {
  const { notifications: initialNotifications } = useGetNotifications();
  const [notifications, setNotifications] = useState<NotificationInterface[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sincroniza estado local com os dados vindos do hook
  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/notification/unread-count");
        setUnreadCount(
          response.data.count ?? response.data.unreadCount ?? response.data,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar contagem de notificações não lidas:",
          error,
        );
      }
    };

    fetchUnreadCount();
  }, []);

  const handleMarkAsRead = async (notiId: string) => {
    try {
      await api.patch(`/notification/${notiId}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notiId ? { ...item, read: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    } finally {
      setOpen(false);
    }
  };

  // PATCH /notification/read-all
  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await api.patch("/notification/read-all");

      // Marca todas localmente como lidas
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-sm shadow-2xl rounded-2xl p-4 bg-white border border-gray-100 flex flex-col gap-3">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-2 gap-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm uppercase tracking-wide">
            Alertas Recentes
          </h3>
        
        </div>

        <div className="flex flex-col items-end gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              title="Marcar todas como lidas"
              className="text-xs text-gray-500 cursor-pointer hover:text-secondary font-medium flex items-center gap-1 transition disabled:opacity-50">
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Marcar todas como lidas</span>
            </button>
          )}

          <Link
            href="/home/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-0.5">
            Ver todas <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto w-full">
        {notifications.length === 0 ? (
          <p className="text-xs text-black/50 text-center py-6">
            Nenhum alerta recente.
          </p>
        ) : (
          notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.targetType === 'POST' ? `/home/post/${notif.targetId}` : '#'}
              onClick={() => handleMarkAsRead(notif.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl transition gap-2 w-full ${
                !notif.isRead
                  ? "bg-secondary/10 hover:bg-secondary/20"
                  : "bg-gray-50 hover:bg-gray-100/80"
              }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-full bg-secondary/10 text-secondary shrink-0">
                  {notif.type === "LIKE" ? (
                    <Heart
                      size={14}
                      fill="currentColor"
                    />
                  ) : (
                    <MessageCircle size={14} />
                  )}
                </div>
                <p className="text-gray-700 text-sm truncate pr-2">
                  <span className="font-semibold">
                    {notif.sender.anon_name}
                  </span>{" "}
                  {notif.type === "LIKE" ? "curtiu" : "comentou"} o seu {notif.targetType === "POST" ? "post" : "comentário"}.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                  {formatRelativeTime(notif.createdAt)}
                </span>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

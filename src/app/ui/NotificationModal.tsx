"use client";

import { MessageCircle, Heart, ExternalLink } from "lucide-react";
import Link from "next/link";
import useGetNotifications from "../hooks/get-notifications";

interface NotificationModalProps {
  setOpen: (open: boolean) => void;
}

// Função auxiliar para formato de tempo relativo moderno
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

  // Para notificações muito antigas, mostra apenas o dia e mês simplificado
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function NotificationModal({ setOpen }: NotificationModalProps) {
  const { notifications } = useGetNotifications();

  console.log("Notifications in modal:", notifications);

  return (
    <div className="card max-w-2xl w-full shadow-2xl rounded-2xl p-4 bg-white border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide">
          Alertas Recentes
        </h3>
        <Link
          href="/home/notifications"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-0.5">
          Ver todas <ExternalLink size={12} />
        </Link>
      </div>

      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto w-full">
        {notifications.length === 0 ? (
          <p className="text-xs text-black/50 text-center py-6">
            Nenhum alerta recente.
          </p>
        ) : (
          notifications.map((notif) => (
            <Link
              key={notif.id}
              href={`/home/post/${notif.targetId}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-full bg-secondary/10 text-secondary shrink-0`}>
                  {notif.type === "like" ? (
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
                  {notif.type === "like" ? "curtiu" : "comentou"} o seu post.
                </p>
              </div>
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                {formatRelativeTime(notif.createdAt)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
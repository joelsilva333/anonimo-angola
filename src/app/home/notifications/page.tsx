"use client";

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
import { useState } from "react";

// Interface demonstrativa baseada no teu Backend genérico
interface NotificationInterface {
  id: string;
  title: string;
  description: string;
  type: "like" | "comment";
  target_id: string; // ID do post para redirecionar
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  // Simulando dados vindo do NotificationRepository / Service
  const [notifications, setNotifications] = useState<NotificationInterface[]>([
    {
      id: "1",
      title: "Novo Apoio!",
      description:
        "Alguém apoiou o teu desabafo sobre 'Crise existencial na faculdade'.",
      type: "like",
      target_id: "uuid-post-1",
      is_read: false,
      created_at: "Há 5 min",
    },
    {
      id: "2",
      title: "Novo Comentário!",
      description: "Um utilizador anônimo comentou no teu post.",
      type: "comment",
      target_id: "uuid-post-2",
      is_read: false,
      created_at: "Há 1 hora",
    },
    {
      id: "3",
      title: "Apoio recebido",
      description: "O teu comentário foi apoiado por outra pessoa.",
      type: "like",
      target_id: "uuid-post-1",
      is_read: true,
      created_at: "Ontem",
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6">
      {/* Top Bar de Navegação */}
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
        {notifications.length === 0 ? (
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
                href={`/home/post/${notification.target_id}`}
                className={`flex items-start justify-between p-4 rounded-2xl transition gap-4 mb-2 last:mb-0 ${
                  notification.is_read
                    ? "bg-white hover:bg-gray-50"
                    : "bg-secondary/10 hover:bg-secondary/20"
                }`}>
                <div className="flex gap-3 items-center justify-center">
                  <div
                    className={`p-1.5 rounded-full bg-secondary/10 text-secondary`}>
                    {notification.type === "like" ? (
                      <Heart
                        size={18}
                        fill={
                          notification.type === "like" ? "currentColor" : "none"
                        }
                      />
                    ) : (
                      <MessageCircle size={18} />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 truncate">
                        {notification.title}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-black/80 leading-relaxed">
                      {notification.description}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-black/50 whitespace-nowrap pt-1">
                  {notification.created_at}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

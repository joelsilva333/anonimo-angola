"use client";

import { MessageCircle, Heart,  ExternalLink } from "lucide-react";
import Link from "next/link";

interface NotificationModalProps {
  setOpen: (open: boolean) => void;
}

export default function NotificationModal({ setOpen }: NotificationModalProps) {
  const quickNotifications = [
    {
      id: "1",
      title: "Novo apoio!",
      type: "like",
      target_id: "uuid-post-1",
      created_at: "5m",
    },
    {
      id: "2",
      title: "Novo comentário!",
      type: "comment",
      target_id: "uuid-post-2",
      created_at: "1h",
    },
  ];

  return (
    <div className="card w-80 shadow-2xl rounded-2xl p-4 bg-white border border-gray-100 flex flex-col gap-3">
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

      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
        {quickNotifications.length === 0 ? (
          <p className="text-xs text-black/50 text-center py-6">
            Nenhum alerta recente.
          </p>
        ) : (
          quickNotifications.map((notif) => (
            <Link
              key={notif.id}
              href={`/home/post/${notif.target_id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-full bg-secondary/10 text-secondary`}>
                  {notif.type === "like" ? (
                    <Heart
                      size={14}
                      fill="currentColor"
                    />
                  ) : (
                    <MessageCircle size={14} />
                  )}
                </div>
                <span className="text-gray-700 truncate max-w-lg w-full">
                  {notif.title}
                </span>
              </div>
              <span className="text-sm text-black/40 font-mono">
                {notif.created_at}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

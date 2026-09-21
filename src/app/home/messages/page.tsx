"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { useConversations } from "@/app/hooks/use-messages";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";
import { customFormatter } from "@/app/utils/customFormatter";

const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.38)",
  borderRadius: "24px",
  boxShadow: "0 4px 24px rgba(30,30,30,0.06)",
};

export default function MessagesPage() {
  const { conversations, loading, error } = useConversations();

  return (
    <div
      className="w-full flex flex-col gap-5 py-6"
      style={{ fontFamily: "'Raleway', sans-serif" }}>
      <div className="flex items-center gap-3">
        <Link href="/home">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold uppercase">Mensagens</h1>
      </div>

      {loading || error ? (
        <div className="w-full flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div
          className="w-full p-8 flex flex-col items-center text-center gap-2"
          style={glassCard}>
          <MessageCircle size={22} style={{ color: "#85cc84" }} />
          <p className="text-sm text-gray-500 max-w-xs">
            Ainda não tens conversas. Podes iniciar uma a partir do perfil de
            alguém com quem já tenhas interagido (a seguir, comentado ou
            respondido).
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          className="w-full flex flex-col gap-2">
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}>
              <Link
                href={`/home/messages/${conversation.id}`}
                className="w-full flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={glassCard}>
                {conversation.user.profile_picture && (
                  <Image
                    src={getProfilePictureUrl(conversation.user.profile_picture)}
                    width={44}
                    height={44}
                    unoptimized
                    alt={conversation.user.anon_name}
                    className="rounded-full object-cover w-11 h-11 shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {conversation.user.anon_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.lastMessage?.text || "Sem mensagens ainda"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {conversation.lastMessage && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={9} />
                      <TimeAgo
                        date={conversation.lastMessage.created_at}
                        formatter={customFormatter}
                      />
                    </span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-white text-[10px] font-bold">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

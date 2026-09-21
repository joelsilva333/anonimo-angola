/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShieldAlert, Flag } from "lucide-react";
import { toast } from "react-toastify";
import { useConversations, useMessages } from "@/app/hooks/use-messages";
import { useUser } from "@/app/hooks/user";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";
import ReportModal from "@/app/ui/ReportModal";

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useUser();
  const { conversations } = useConversations();
  const { messages, loading, markAsRead, sendMessage } =
    useMessages(conversationId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    markAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !conversation) return;
    const value = text;
    setText("");
    setSending(true);
    try {
      await sendMessage(conversation.user.id, value);
    } catch (error: any) {
      if (error?.response?.data?.code === "MODERATION_BLOCKED") {
        setBlockedMessage(
          error.response.data.error ||
            "Esta mensagem não pode ser enviada por violar as regras de segurança da comunidade.",
        );
      } else {
        toast.error(
          error?.response?.data?.error ||
            "Erro ao enviar mensagem. Tenta novamente.",
        );
      }
      setText(value);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="w-full flex flex-col gap-4 py-6"
      style={{ fontFamily: "'Raleway', sans-serif" }}>
      <div className="flex items-center gap-3">
        <Link href="/home/messages">
          <ArrowLeft size={20} />
        </Link>
        {conversation && (
          <Link
            href={`/home/profile/${conversation.user.id}`}
            className="flex items-center gap-2.5">
            {conversation.user.profile_picture && (
              <Image
                src={getProfilePictureUrl(conversation.user.profile_picture)}
                width={32}
                height={32}
                unoptimized
                alt={conversation.user.anon_name}
                className="rounded-full object-cover w-8 h-8"
              />
            )}
            <p className="text-sm font-semibold text-gray-900">
              {conversation.user.anon_name}
            </p>
          </Link>
        )}
      </div>

      <div
        className="flex items-center gap-2 p-3 rounded-2xl text-xs text-gray-500"
        style={{ background: "rgba(133,204,132,0.1)" }}>
        <ShieldAlert size={14} className="text-secondary shrink-0" />
        As mensagens são analisadas por IA para prevenir discurso de ódio,
        assédio e doxxing.
      </div>

      <div
        className="w-full flex flex-col gap-2 p-4 overflow-y-auto"
        style={{
          minHeight: "50vh",
          maxHeight: "60vh",
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.38)",
          borderRadius: "24px",
        }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-center text-gray-400 py-8 m-auto">
            Ainda não há mensagens. Diz olá!
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user?.id;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group flex items-center gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <button
                    onClick={() => setReportTargetId(message.id)}
                    title="Denunciar mensagem"
                    className="p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-60 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 cursor-pointer shrink-0">
                    <Flag size={13} />
                  </button>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "text-white rounded-br-md"
                      : "text-gray-800 rounded-bl-md"
                  }`}
                  style={{
                    background: isMine ? "#85cc84" : "rgba(255,255,255,0.85)",
                    border: isMine ? "none" : "1px solid rgba(0,0,0,0.06)",
                  }}>
                  {message.text}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.50)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.45)",
          borderRadius: "14px",
        }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="outline-none w-full px-4 py-2.5 bg-transparent text-sm"
          type="text"
          placeholder="Escreve uma mensagem..."
          style={{ fontFamily: "'Raleway', sans-serif", color: "#1e1e1e" }}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 py-2.5 cursor-pointer flex gap-2 text-white font-semibold text-sm transition-colors duration-200 hover:bg-secondary-hover shrink-0 disabled:opacity-50"
          style={{
            background: "#85cc84",
            borderRadius: "0 13px 13px 0",
          }}>
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      <AnimatePresence>
        {blockedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(12px)",
            }}>
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="max-w-sm w-full flex flex-col text-center items-center p-8"
              style={{
                background: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.55)",
                borderRadius: "28px",
                boxShadow: "0 24px 64px rgba(30,30,30,0.20)",
                fontFamily: "'Raleway', sans-serif",
              }}>
              <div
                className="p-4 rounded-3xl mb-3 flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Não conseguimos enviar esta mensagem
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {blockedMessage}
              </p>
              <button
                onClick={() => setBlockedMessage(null)}
                className="btn-primary w-full">
                Entendi, vou rever a mensagem
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportModal
        isOpen={!!reportTargetId}
        onClose={() => setReportTargetId(null)}
        targetType="message"
        targetId={reportTargetId || ""}
      />
    </div>
  );
}

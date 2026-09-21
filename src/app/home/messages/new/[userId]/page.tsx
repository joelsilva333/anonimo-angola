/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShieldAlert, Lock, UserX } from "lucide-react";
import { api } from "@/app/api/config";
import { useConversations } from "@/app/hooks/use-messages";
import { useUserProfile } from "@/app/hooks/user";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";

interface BlockedInfo {
  icon: "moderation" | "interaction";
  title: string;
  message: string;
}

export default function NewConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { conversations, loading: conversationsLoading } = useConversations();
  const { profile, loading: profileLoading } = useUserProfile(userId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<BlockedInfo | null>(null);

  // Se já existir uma conversa com esta pessoa, salta logo para ela.
  useEffect(() => {
    if (conversationsLoading) return;
    const existing = conversations.find((c) => c.user.id === userId);
    if (existing) {
      router.replace(`/home/messages/${existing.id}`);
    }
  }, [conversations, conversationsLoading, userId, router]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const response = await api.post(`/messages/${userId}`, { text });
      router.replace(`/home/messages/${response.data.data.conversationId}`);
    } catch (error: any) {
      if (error?.response?.data?.code === "MODERATION_BLOCKED") {
        setBlockedInfo({
          icon: "moderation",
          title: "Não conseguimos enviar esta mensagem",
          message:
            error.response.data.error ||
            "Esta mensagem não pode ser enviada por violar as regras de segurança da comunidade.",
        });
      } else {
        setBlockedInfo({
          icon: "interaction",
          title: "Ainda não podes conversar com esta pessoa",
          message:
            error?.response?.data?.error ||
            "Não é possível iniciar esta conversa.",
        });
      }
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
        {!profileLoading && profile && (
          <span className="flex items-center gap-2.5">
            {profile.profile_picture && (
              <Image
                src={getProfilePictureUrl(profile.profile_picture)}
                width={32}
                height={32}
                unoptimized
                alt={profile.anon_name}
                className="rounded-full object-cover w-8 h-8"
              />
            )}
            <p className="text-sm font-semibold text-gray-900">
              {profile.anon_name}
            </p>
          </span>
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
        className="w-full flex items-center justify-center p-8"
        style={{
          minHeight: "40vh",
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.38)",
          borderRadius: "24px",
        }}>
        <p className="text-sm text-center text-gray-400">
          Ainda não há mensagens. Escreve a primeira!
        </p>
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
        {blockedInfo && (
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
                style={{
                  background:
                    blockedInfo.icon === "moderation"
                      ? "rgba(239,68,68,0.12)"
                      : "rgba(240,170,110,0.15)",
                  color: blockedInfo.icon === "moderation" ? "#ef4444" : "#c9711f",
                }}>
                {blockedInfo.icon === "moderation" ? (
                  <ShieldAlert size={32} />
                ) : (
                  <UserX size={32} />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {blockedInfo.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {blockedInfo.message}
              </p>

              {blockedInfo.icon === "interaction" && (
                <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 justify-center">
                  <Lock size={12} />
                  Segue, comenta ou responde a algo desta pessoa para poderes
                  enviar-lhe mensagem.
                </p>
              )}

              <div className="flex gap-2 w-full">
                {blockedInfo.icon === "interaction" && (
                  <Link
                    href={`/home/profile/${userId}`}
                    className="btn-secondary flex-1 text-center">
                    Ver perfil
                  </Link>
                )}
                <button
                  onClick={() => setBlockedInfo(null)}
                  className={
                    blockedInfo.icon === "interaction"
                      ? "flex-1 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600 rounded-xl transition-all duration-200 cursor-pointer"
                      : "btn-primary flex-1"
                  }>
                  {blockedInfo.icon === "interaction"
                    ? "Fechar"
                    : "Entendi, vou rever a mensagem"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

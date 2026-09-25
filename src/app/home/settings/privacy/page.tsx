/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { EyeOff, MessageSquare, UserX, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@/app/hooks/user";
import { api } from "@/app/api/config";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";

interface BlockedUser {
  id: string;
  anon_name: string;
  profile_picture: string;
  blockedAt: string;
}

export default function PrivacySettings() {
  const { user } = useUser();

  const [anonymousMode, setAnonymousMode] = useState(false);
  const [commentPermission, setCommentPermission] = useState<
    "everyone" | "authenticated" | "nobody"
  >("everyone");
  const [dmPermission, setDmPermission] = useState<
    "everyone" | "connections" | "nobody"
  >("connections");
  const [saving, setSaving] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setAnonymousMode(user.anonymous_mode ?? false);
    setCommentPermission(user.comment_permission ?? "everyone");
    setDmPermission(user.dm_permission ?? "connections");
  }, [user]);

  const fetchBlocked = async () => {
    try {
      setBlockedLoading(true);
      const response = await api.get("/users/blocked");
      setBlockedUsers(response.data.items || []);
    } catch (error) {
      console.error("Erro ao buscar utilizadores bloqueados:", error);
    } finally {
      setBlockedLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const response = await api.put(`/users/${user.id}`, {
        anonymous_mode: anonymousMode,
        comment_permission: commentPermission,
        dm_permission: dmPermission,
      });

      const stored = localStorage.getItem("user_data");
      if (stored) {
        localStorage.setItem(
          "user_data",
          JSON.stringify({ ...JSON.parse(stored), ...response.data.user }),
        );
      }

      toast.success("Definições de privacidade guardadas!");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao guardar definições.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (blockedUser: BlockedUser) => {
    try {
      setUnblockingId(blockedUser.id);
      await api.post(`/users/${blockedUser.id}/block`);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedUser.id));
      toast.success(`${blockedUser.anon_name} foi desbloqueado.`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao desbloquear utilizador.",
      );
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6"
    >
      {/* Cabeçalho da Página */}
      <div className="flex items-center gap-3">
        <Link href="/home/settings">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold uppercase">Privacidade e Segurança</h1>
      </div>

      {/* Card Principal: Configurações de Privacidade */}
      <div className="card flex flex-col gap-6">

        {/* Opção: Modo Anônimo Permanente */}
        <div className="flex flex-col gap-3">
          <label className="font-semibold flex items-center gap-2">
            <EyeOff size={20} className="text-black/80" />
            Modo Anônimo Permanente
          </label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-black/80 max-w-[80%]">
              Os teus desabafos, comentários e respostas passam a aparecer como
              &quot;Anônimo&quot;, sem link para o teu perfil — ninguém consegue associar
              várias publicações tuas à mesma identidade só de olhar para o feed.
            </p>
            <input
              type="checkbox"
              checked={anonymousMode}
              onChange={(e) => setAnonymousMode(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Opção: Controle de Comentários */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <MessageSquare size={20} className="text-black/80" />
            Controle de Comentários nos teus Posts
          </label>
          <select
            value={commentPermission}
            onChange={(e) => setCommentPermission(e.target.value as any)}
            className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 outline-none cursor-pointer text-sm">
            <option value="everyone">Permitir que qualquer utilizador comente</option>
            <option value="authenticated">Apenas utilizadores com conta criada</option>
            <option value="nobody">Desativar comentários globalmente nos meus posts</option>
          </select>
        </div>

        {/* Opção: Quem pode enviar Mensagens Privadas */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <MessageCircle size={20} className="text-black/80" />
            Mensagens Privadas (Chats)
          </label>
          <select
            value={dmPermission}
            onChange={(e) => setDmPermission(e.target.value as any)}
            className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 outline-none cursor-pointer text-sm">
            <option value="everyone">Qualquer pessoa pode iniciar um chat anônimo comigo</option>
            <option value="connections">Apenas pessoas com quem interagi em posts</option>
            <option value="nobody">Bloquear novas solicitações de mensagens privadas</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-secondary w-full sm:w-auto self-start">
          {saving ? (
            <div className="w-4 h-4 rounded-full border-2 border-current/40 border-t-current animate-spin" />
          ) : (
            "Guardar Definições de Privacidade"
          )}
        </button>
      </div>

      {/* Card Secundário: Utilizadores Bloqueados */}
      <div className="card rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <UserX size={20} /> Utilizadores Bloqueados
          </h2>
          <p className="text-sm text-black/80">
            Gerir as identidades anónimas que bloqueaste. Utilizadores bloqueados não
            conseguem ver os teus desabafos no feed, comentar-te, seguir-te nem
            enviar-te mensagens (bloqueia-se a partir do perfil da pessoa).
          </p>
        </div>

        {blockedLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-sm text-zinc-500">
            Nenhum utilizador bloqueado de momento.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {blockedUsers.map((blockedUser) => (
              <li
                key={blockedUser.id}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  {blockedUser.profile_picture && (
                    <Image
                      src={getProfilePictureUrl(blockedUser.profile_picture)}
                      width={34}
                      height={34}
                      unoptimized
                      alt={blockedUser.anon_name}
                      className="rounded-full object-cover w-[34px] h-[34px] shrink-0"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {blockedUser.anon_name}
                  </span>
                </div>
                <button
                  onClick={() => handleUnblock(blockedUser)}
                  disabled={unblockingId === blockedUser.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-secondary hover:bg-secondary/10 transition-colors duration-200 cursor-pointer disabled:opacity-40 shrink-0">
                  Desbloquear
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PostInterface } from "@/app/interfaces/post";
import { EllipsisVertical, Forward, MessageCircle, Heart, Clock } from "lucide-react";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { customFormatter } from "@/app/utils/customFormatter";
import { SubmitHandler, useForm } from "react-hook-form";
import Comment from "./Comment";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/config";
import { AnimatePresence, motion } from "framer-motion";
import { ShareResponse } from "../interfaces/share";
import Link from "next/link";
import {
  FaTimes,
  FaWhatsapp,
  FaFacebookF,
  FaLinkedinIn,
  FaRegCopy,
} from "react-icons/fa";
import { getProfilePictureUrl } from "../utils/getProfilePicture";

interface CommentInput {
  text: string;
}

const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.38)",
  borderRadius: "24px",
  boxShadow: "0 4px 24px rgba(30,30,30,0.06), 0 1px 4px rgba(30,30,30,0.04)",
};

export default function Post({
  post,
  refetch,
}: {
  post: PostInterface;
  refetch: (options?: any) => void;
}) {
  const { register, handleSubmit, reset, setFocus } = useForm<CommentInput>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showAll, setShowAll] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [liked, setLiked] = useState(post.has_reacted || false);
  const [likesCount, setLikesCount] = useState(post.like || 0);
  const [shareLinks, setShareLinks] = useState<ShareResponse["shareLinks"] | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setLiked(post.has_reacted || false);
    setLikesCount(post.like || 0);
    setComments(post.comments || []);
  }, [post]);

  const isAuthenticated = (): boolean => {
    if (typeof window !== "undefined") return !!localStorage.getItem("user_data");
    return false;
  };

  const INITIAL_COMMENTS_LIMIT = 2;
  const displayedComments = showAll ? comments : comments.slice(0, INITIAL_COMMENTS_LIMIT);

  const onSubmit: SubmitHandler<CommentInput> = async (data) => {
    try {
      if (!isAuthenticated()) { setIsLoginModalOpen(true); return; }
      setLoading(true);
      const response = await api.post(`/comments/${post.id}`, data);
      if (response.status === 201) {
        setComments((prev) => [response.data.comment, ...prev]);
        router.refresh();
        reset();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao comentar. Tente novamente.");
    } finally { setLoading(false); }
  };

  const handleLike = async () => {
    if (!isAuthenticated()) { setIsLoginModalOpen(true); return; }
    try {
      const response = await api.post(`/reactions/post/${post.id}`, { type: "like" });
      if (response.status === 200) refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao reagir. Tente novamente.");
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.post("/shares/", { postId: post.id, platform: "link" });
      if (response.status === 201) {
        const data: ShareResponse = response.data;
        setShareLinks(data.shareLinks);
        setIsShareModalOpen(true);
        navigator.clipboard.writeText(data.shareLinks.rawLink);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao gerar links. Tente novamente.");
    }
  };

  const isLong = post.text.length < 100;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.25 }}
        className="w-full flex flex-col gap-4 p-6"
        style={glassCard}
      >
        {/* Cabeçalho do post */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(post.profile_picture || post.user?.profile_picture) && (
              <div className="relative">
                <Image
                  src={getProfilePictureUrl(post.profile_picture || post.user?.profile_picture || "")}
                  width={44}
                  height={44}
                  unoptimized
                  alt="Foto de perfil"
                  className="rounded-full object-cover w-11 h-11"
                  style={{ border: "2px solid rgba(133,204,132,0.35)" }}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: "#85cc84" }}
                />
              </div>
            )}
            <span className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {post.anon_name || post.user?.anon_name}
              </p>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={10} />
                <TimeAgo date={post.created_at} formatter={customFormatter} />
              </span>
            </span>
          </div>

          <button
            className="p-1.5 rounded-full transition-all duration-200 cursor-pointer hover:bg-black/5"
          >
            <EllipsisVertical size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Texto */}
        <p
          className={`leading-relaxed text-gray-800 ${isLong ? "text-xl max-lg:text-lg font-medium" : "text-base max-lg:text-sm"}`}
          style={{ fontFamily: "'Raleway', sans-serif", fontWeight: isLong ? 500 : 400 }}
        >
          {post.text}
        </p>

        {likesCount > 0 && (
          <p className="text-xs text-gray-400" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {liked && post.reaction_type === "like"
              ? `Você${likesCount > 1 ? ` e mais ${likesCount - 1}` : ""} apoiou`
              : `${likesCount} pessoa${likesCount > 1 ? "s" : ""} ${likesCount > 1 ? "apoiaram" : "apoiou"}`}
          </p>
        )}

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
          <ul className="flex items-center justify-between gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {/* Apoiar */}
            <li className="w-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`w-full flex justify-center items-center py-2 rounded-xl gap-2 cursor-pointer transition-all duration-200 text-sm font-medium ${
                  liked && post.reaction_type === "like"
                    ? "bg-secondary/15 text-secondary"
                    : "hover:bg-black/5 text-gray-600"
                }`}
              >
                <Heart
                  size={17}
                  className={`transition-all duration-300 ${liked && post.reaction_type === "like" ? "fill-secondary text-secondary" : ""}`}
                />
                <span className="max-lg:hidden">
                  {liked && post.reaction_type === "like" ? "Apoiou" : "Apoiar"}
                </span>
              </motion.button>
            </li>

            {/* Comentar */}
            <li className="w-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!isAuthenticated()) setIsLoginModalOpen(true);
                  else setFocus("text");
                }}
                className="flex w-full justify-center py-2 rounded-xl hover:bg-black/5 transition-all duration-200 items-center gap-2 cursor-pointer text-sm font-medium text-gray-600"
              >
                <MessageCircle size={17} />
                <span className="max-lg:hidden">Comentar</span>
                {comments.length > 0 && (
                  <span className="text-xs text-gray-400 ml-0.5">({comments.length})</span>
                )}
              </motion.button>
            </li>

            {/* Partilhar */}
            <li className="w-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex w-full justify-center items-center py-2 rounded-xl hover:bg-black/5 transition-all duration-200 gap-2 cursor-pointer text-sm font-medium text-gray-600"
              >
                <Forward size={17} />
                <span className="max-lg:hidden">Partilhar</span>
              </motion.button>
            </li>
          </ul>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
        </div>

        {/* Comentários */}
        <div className="flex flex-col gap-3">
          {displayedComments.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {displayedComments.map((comment) => (
                <Comment key={comment.id} comment={comment} refetch={refetch} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-400 py-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Seja o primeiro a comentar!
            </p>
          )}

          {!showAll && comments.length > INITIAL_COMMENTS_LIMIT && (
            <button
              type="button"
              className="text-xs text-secondary font-semibold cursor-pointer hover:underline self-start"
              style={{ fontFamily: "'Raleway', sans-serif" }}
              onClick={() => setShowAll(true)}
            >
              Ver mais comentários ({comments.length - INITIAL_COMMENTS_LIMIT})
            </button>
          )}
          {showAll && comments.length > INITIAL_COMMENTS_LIMIT && (
            <button
              type="button"
              className="text-xs text-gray-400 font-semibold cursor-pointer hover:underline self-start"
              style={{ fontFamily: "'Raleway', sans-serif" }}
              onClick={() => setShowAll(false)}
            >
              Ocultar comentários
            </button>
          )}
        </div>

        {/* Input de comentário */}
        {isAuthenticated() && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.50)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: "14px",
            }}
          >
            <input
              {...register("text", { required: true })}
              className="outline-none w-full px-4 py-2.5 bg-transparent text-sm"
              type="text"
              placeholder="Adicionar um comentário..."
              style={{ fontFamily: "'Raleway', sans-serif", color: "#1e1e1e" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 cursor-pointer flex gap-2 text-white font-semibold text-sm transition-colors duration-200 hover:bg-secondary-hover shrink-0"
              style={{ background: "#85cc84", borderRadius: "0 13px 13px 0", fontFamily: "'Raleway', sans-serif" }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                "Enviar"
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* Modal: Precisa de login */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="max-w-sm w-full flex flex-col text-center items-center p-8"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.50)",
                borderRadius: "32px",
                boxShadow: "0 24px 64px rgba(30,30,30,0.18)",
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="p-4 rounded-3xl mb-3 flex items-center justify-center"
                style={{ background: "rgba(133,204,132,0.15)", color: "#85cc84" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Junta-te à comunidade!</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Para apoiar, comentar ou partilhar o teu desabafo, faz parte da{" "}
                <span className="font-semibold text-secondary">Anónimo Angola</span>.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push("/login")} className="btn-primary">
                  Entrar na minha conta
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push("/register")} className="btn-secondary">
                  Criar conta anónima grátis
                </motion.button>
                <button onClick={() => setIsLoginModalOpen(false)} className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors duration-200 cursor-pointer mt-1">
                  Continuar apenas a ler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Partilhar */}
      <AnimatePresence>
        {isShareModalOpen && shareLinks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative max-w-sm w-full flex flex-col text-center items-center p-6"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.50)",
                borderRadius: "28px",
                boxShadow: "0 24px 64px rgba(30,30,30,0.18)",
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors duration-200 cursor-pointer hover:bg-black/5"
              >
                <FaTimes />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-1">Partilhar desabafo</h3>
              <p className="text-sm text-gray-500 mb-5">Ajuda a espalhar a palavra de forma anónima.</p>

              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { href: shareLinks.whatsapp, icon: <FaWhatsapp />, label: "WhatsApp", color: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white" },
                  { href: shareLinks.facebook, icon: <FaFacebookF />, label: "Facebook", color: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white" },
                  { href: shareLinks.linkedin, icon: <FaLinkedinIn />, label: "LinkedIn", color: "bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-white" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${item.color}`}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLinks.rawLink);
                    toast.success("Link copiado!");
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-200 font-semibold text-sm active:scale-[0.98]"
                >
                  <FaRegCopy /> Copiar Link
                </button>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-2.5 mt-4 text-sm font-medium text-gray-400 hover:text-gray-700 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

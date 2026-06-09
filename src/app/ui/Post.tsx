/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PostInterface } from "@/app/interfaces/post";
import { EllipsisVertical, Forward, MessageCircle, Heart } from "lucide-react";
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
import { FaTimes, FaWhatsapp, FaFacebookF, FaLinkedinIn, FaRegCopy } from "react-icons/fa";

interface CommentInput {
  text: string;
}

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

  const [shareLinks, setShareLinks] = useState<
    ShareResponse["shareLinks"] | null
  >(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setLiked(post.has_reacted || false);
    setLikesCount(post.like || 0);
    setComments(post.comments || []);
  }, [post]);

  const isAuthenticated = (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("user_data");
    }
    return false;
  };

  const INITIAL_COMMENTS_LIMIT = 2;
  const displayedComments = showAll
    ? comments
    : comments.slice(0, INITIAL_COMMENTS_LIMIT);

  const onSubmit: SubmitHandler<CommentInput> = async (data) => {
    try {
      if (!isAuthenticated()) {
        setIsLoginModalOpen(true);
        return;
      }

      setLoading(true);
      const response = await api.post(`/comments/${post.id}`, data);
      if (response.status === 201) {
        const newComment = response.data.comment;
        setComments((prev) => [newComment, ...prev]);
        router.refresh();
        reset();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        "Erro ao fazer comentário. Por favor, tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated()) {
      setIsLoginModalOpen(true);
      return;
    }

    const type =
      liked === true && post.reaction_type === "like" ? "dislike" : "like";

    try {
      const response = await api.post(`/reactions/post/${post.id}`, {
        type: type,
      });

      if (response.status === 200) {
        refetch();
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error(
          "ID Inexistente. Por favor, atualize a página e tente novamente.",
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Erro ao reagir ao post. Por favor, tente novamente.",
        );
      }
    }
  };

  const handleShare = async () => {
    try {
      // Chamada à API igual ao teu Postman
      const response = await api.post("/shares/", {
        postId: post.id,
        platform: "link",
      });

      if (response.status === 201) {
        const data: ShareResponse = response.data;
        setShareLinks(data.shareLinks);
        setIsShareModalOpen(true);

        // Copia o link principal por padrão para facilitar
        navigator.clipboard.writeText(data.shareLinks.rawLink);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Erro ao gerar links de partilha. Tente novamente.",
      );
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 max-lg:gap-3">
            {post.profile_picture && (
              <Image
                src={post.profile_picture}
                width={50}
                height={50}
                unoptimized
                alt="Profile Picture"
                className="rounded-full bg-gray-200 max-lg:w-12"
              />
            )}

            {post.user?.profile_picture && (
              <Image
                src={post.user.profile_picture}
                width={50}
                height={50}
                unoptimized
                alt="Profile Picture"
                className="rounded-full bg-gray-200 max-lg:w-12"
              />
            )}

            <span className="flex flex-col max-lg:text-sm">
              <p className="text-lg font-semibold">
                {post.anon_name || post.user?.anon_name}
              </p>
              <p className="text-sm text-[#757575]">
                <TimeAgo
                  date={post.created_at}
                  formatter={customFormatter}
                />
              </p>
            </span>
          </div>

          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
            <EllipsisVertical className="text-[#757575]" />
          </button>
        </div>

        <p
          className={`leading-relaxed ${
            post.text.length < 100
              ? "text-2xl max-lg:text-xl"
              : "text-base max-lg:text-sm"
          }`}>
          {post.text}
        </p>

        {likesCount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {liked === true && post.reaction_type === "like"
              ? `Você${likesCount > 1 ? ` e mais ${likesCount - 1}` : ""}`
              : `${likesCount} pessoa${likesCount > 1 ? "s" : ""} ${
                  likesCount > 1 ? "apoiaram" : "apoiou"
                }`}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <hr className="border-gray-200" />

          <ul className="flex items-center justify-between gap-4 font-medium text-gray-700">
            <li className="w-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`w-full flex justify-center items-center p-2 rounded-md gap-2 cursor-pointer transition-colors duration-300 ${
                  liked === true && post.reaction_type === "like"
                    ? "bg-secondary/20 text-secondary"
                    : "hover:bg-gray-100"
                }`}>
                <Heart
                  className={`w-5 transition-all duration-300 ${
                    liked === true && post.reaction_type === "like"
                      ? "fill-secondary text-secondary"
                      : ""
                  }`}
                />
                <span className="max-lg:text-sm max-lg:hidden">
                  {liked === true && post.reaction_type === "like"
                    ? "Apoiou"
                    : "Apoiar"}
                </span>
              </motion.button>
            </li>

            <li className="w-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!isAuthenticated()) {
                    setIsLoginModalOpen(true);
                  } else {
                    setFocus("text");
                  }
                }}
                type="button"
                className="flex w-full justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 items-center gap-2 cursor-pointer">
                <MessageCircle className="w-5" />
                <span className="max-lg:text-sm max-lg:hidden">Comentar</span>
                <span className="text-xs text-gray-500 ml-1">
                  {comments.length > 0 && comments.length}
                </span>
              </motion.button>
            </li>

            <li className="w-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex hover:bg-gray-100 w-full justify-center items-center p-2 rounded-md transition-colors duration-300 gap-2 cursor-pointer">
                <Forward className="w-5" />
                <span className="max-lg:text-sm max-lg:hidden">Partilhar</span>
              </motion.button>
            </li>
          </ul>

          <hr className="border-gray-200" />
        </div>

        <div className="flex flex-col gap-4">
          {displayedComments.length > 0 ? (
            displayedComments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                refetch={refetch}
              />
            ))
          ) : (
            <p className="text-sm text-center text-gray-400">
              Nenhum comentário, seja o primeiro a comentar!
            </p>
          )}

          {!showAll && comments.length > INITIAL_COMMENTS_LIMIT && (
            <button
              type="button"
              className="text-sm text-center text-[#757575] font-medium cursor-pointer hover:text-gray-900 mt-2 self-start"
              onClick={() => setShowAll(true)}>
              Ver mais comentários ({comments.length - INITIAL_COMMENTS_LIMIT})
            </button>
          )}

          {showAll && comments.length > INITIAL_COMMENTS_LIMIT && (
            <button
              type="button"
              className="text-sm text-center text-[#757575] font-medium cursor-pointer hover:text-gray-900 mt-2 self-start"
              onClick={() => setShowAll(false)}>
              Ocultar comentários
            </button>
          )}
        </div>

        {isAuthenticated() && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            <input
              {...register("text", { required: true })}
              className="outline-none w-full px-4 py-2 bg-transparent text-sm"
              type="text"
              placeholder="Adicionar um comentário..."
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-secondary rounded-none cursor-pointer flex gap-2 text-white hover:bg-secondary/80 transition-colors duration-300">
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Enviar"
              )}
            </button>
          </form>
        )}
      </motion.div>

      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full mx-4 flex flex-col text-center items-center border border-gray-100">
              {/* Ícone de Destaque / Identidade Visual */}
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="bg-secondary/10 text-secondary p-4 rounded-3xl mb-2 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8">
                  {/* Um ícone personalizado combinando mensagens ocultas/cadeado */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </motion.div>

              <h3 className="text-2xl font-bold tracking-tight px-2">
                Junta-te à nossa roda de desabafos!
              </h3>

              <p className=" text-gray-500 leading-relaxed mt-2 px-1">
                Para partilhares o teu próprio desabafo, apoiar ou comentar nas
                histórias da banda, precisas de fazer parte da comunidade{" "}
                <span className="font-semibold text-secondary">
                  Anónimo Angola
                </span>
                .
              </p>

              <div className="flex flex-col gap-3 w-full mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/login")}
                  className="btn-primary">
                  Entrar na minha conta
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/register")}
                  className="btn-secondary">
                  Criar conta anónima grátis
                </motion.button>

                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-all duration-300 hover:scale-105 cursor-pointer mt-3">
                  Continuar apenas a ler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShareModalOpen && shareLinks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] max-w-sm w-full flex flex-col text-center items-center border border-gray-100">
              {/* Botão Fechar Superior */}
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                aria-label="Fechar">
                <FaTimes className="text-lg" />
              </button>

              {/* Cabeçalho */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1.5">
                  Partilhar este desabafo
                </h3>
                <p className="text-sm text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                  Ajuda a espalhar a palavra de forma anónima nas tuas redes.
                </p>
              </div>

              {/* Grelha de Botões */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* WhatsApp */}
                <Link
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 bg-green-50 text-green-700 rounded-2xl hover:bg-green-600 hover:text-white transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-green-100 active:scale-[0.98]">
                  <FaWhatsapp className="text-lg" />
                  <span>WhatsApp</span>
                </Link>

                {/* Facebook */}
                <Link
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-blue-100 active:scale-[0.98]">
                  <FaFacebookF className="text-base" />
                  <span>Facebook</span>
                </Link>

                {/* LinkedIn */}
                <Link
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 bg-sky-50 text-sky-700 rounded-2xl hover:bg-sky-700 hover:text-white transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-sky-100 active:scale-[0.98]">
                  <FaLinkedinIn className="text-base" />
                  <span>LinkedIn</span>
                </Link>

                {/* Copiar Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLinks.rawLink);
                    toast.success("Link copiado para a área de transferência!");
                  }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-200 font-semibold text-sm shadow-sm active:scale-[0.98]">
                  <FaRegCopy className="text-base" />
                  <span>Copiar Link</span>
                </button>
              </div>

              {/* Botão Cancelar Inferior */}
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-3 mt-4 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200">
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

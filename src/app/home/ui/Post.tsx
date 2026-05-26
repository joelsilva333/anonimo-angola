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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/config";
import { motion } from "framer-motion";

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

  const [liked, setLiked] = useState(false);

  const [sharesCount, setSharesCount] = useState(
    Math.floor(Math.random() * 10),
  );

  const displayedComments = showAll ? comments : comments.slice(0, 1);

  const onSubmit: SubmitHandler<CommentInput> = async (data) => {
    try {
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
    const type = liked ? "dislike" : "like";

    try {
      setLiked((prev) => !prev);
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

  const handleShare = () => {
    setSharesCount((prev) => prev + 1);
    navigator.clipboard.writeText(window.location.href);
    toast.info("Link da publicação copiado para a área de transferência!");
  };

  return (
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

      {post.like > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {liked
            ? `Você${post.like > 1 ? ` e mais ${post.like - 1}` : ""}`
            : `${post.like} pessoa${post.like > 1 ? "s" : ""} ${
                post.like > 1 ? "apoiaram" : "apoiou"
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
                liked ? "bg-secondary/20 text-secondary" : "hover:bg-gray-100"
              }`}>
              <Heart
                className={`w-5 transition-all duration-300 ${
                  liked ? "fill-secondary text-secondary" : ""
                }`}
              />
              <span className="max-lg:text-sm max-lg:hidden">
                {liked ? "Apoiou" : "Apoiar"}
              </span>
            </motion.button>
          </li>

          <li className="w-full">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setFocus("text")}
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
              <span className="text-xs text-gray-500 ml-1">
                {sharesCount > 0 && sharesCount}
              </span>
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

        {!showAll && comments.length > 6 && (
          <button
            className="text-sm text-center text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={() => setShowAll(true)}>
            Ver todos comentários
          </button>
        )}
      </div>

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
    </motion.div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PostCommentInterface } from "@/app/interfaces/comments";
import { customFormatter } from "@/app/utils/customFormatter";
import { EllipsisVertical, MessageCircle, Heart, Clock } from "lucide-react";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "@/app/api/config";
import { motion, AnimatePresence } from "framer-motion";
import { getProfilePictureUrl } from "../utils/getProfilePicture";

interface ReplyInput {
  text: string;
}

const commentStyle = {
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.40)",
  borderRadius: "14px",
  padding: "12px 14px",
  fontFamily: "'Raleway', sans-serif",
};

export default function Comment({
  comment,
  refetch,
}: {
  comment: PostCommentInterface;
  refetch: (options?: any) => void;
}) {
  const [replyMode, setReplyMode] = useState(false);
  const [answers, setAnswers] = useState(
    (comment.answers || []).sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentLiked, setCommentLiked] = useState(
    comment.has_reacted || false,
  );
  const [commentLikesCount, setCommentLikesCount] = useState(comment.like || 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { register, reset, handleSubmit } = useForm<ReplyInput>();

  const isAuthenticated = (): boolean => {
    if (typeof window !== "undefined")
      return !!localStorage.getItem("user_data");
    return false;
  };

  const onSubmit: SubmitHandler<ReplyInput> = async (data) => {
    try {
      setLoading(true);
      const response = await api.post(`/answers/${comment.id}`, {
        text: data.text,
      });
      refetch();
      if (response.status === 201 && response.data?.answer) {
        setAnswers((prev) =>
          [
            ...prev,
            { ...response.data.answer, has_reacted: false, likes: 0 },
          ].sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
        );
        setShowAnswers(true);
      }
    } catch (error) {
      console.error("Erro ao responder:", error);
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleCommentLike = async () => {
    if (!isAuthenticated()) {
      setIsLoginModalOpen(true);
      return;
    }
    const prev = commentLiked;
    setCommentLiked(!prev);
    setCommentLikesCount((c) => (prev ? c - 1 : c + 1));
    try {
      await api.post(`/reactions/comment/${comment.id}`, {
        type: prev ? "dislike" : "like",
      });
      refetch();
    } catch {
      setCommentLiked(prev);
      setCommentLikesCount(commentLikesCount);
    }
  };

  const handleAnswerLike = async (answerId: string, currentLiked: boolean) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? {
              ...a,
              has_reacted: !currentLiked,
              like: currentLiked ? (a.like || 1) - 1 : (a.like || 0) + 1,
            }
          : a,
      ),
    );
    try {
      await api.post(`/reactions/answer/${answerId}`, {
        type: currentLiked ? "dislike" : "like",
      });
      refetch();
    } catch {
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === answerId ? { ...a, has_reacted: currentLiked } : a,
        ),
      );
    }
  };

  return (
    <li
      className="w-full flex flex-col gap-2"
      style={commentStyle}>
      {/* Cabeçalho */}
      <div className="flex gap-2 items-center justify-between">
        <span className="flex gap-2.5 items-center">
          {comment.profile_picture && (
            <Image
              src={getProfilePictureUrl(comment.profile_picture)}
              width={32}
              height={32}
              unoptimized
              alt="Perfil"
              className="rounded-full object-cover w-7 h-7"
              style={{ border: "1.5px solid rgba(133,204,132,0.30)" }}
            />
          )}
          <span className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-800">
              {comment.anon_name}
            </p>
            <span className="text-gray-300 text-xs">•</span>
            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
              <Clock size={9} />
              <TimeAgo
                date={comment.created_at}
                formatter={customFormatter}
              />
            </span>
          </span>
        </span>
        <button className="p-1 rounded-full hover:bg-black/5 transition-colors duration-200 cursor-pointer">
          <EllipsisVertical
            size={15}
            className="text-gray-400"
          />
        </button>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>

      {/* Ações */}
      <div className="flex items-center gap-1">
        {isAuthenticated() && (
          <>
            <button
              onClick={handleCommentLike}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                commentLiked
                  ? "bg-secondary/15 text-secondary"
                  : "hover:bg-black/5 text-gray-500"
              }`}>
              <Heart
                size={12}
                className={commentLiked ? "fill-current" : ""}
              />
              {commentLiked ? "Apoiou" : "Apoiar"}
              {commentLikesCount > 0 && (
                <span className="opacity-60">({commentLikesCount})</span>
              )}
            </button>

            <button
              onClick={() => setReplyMode(!replyMode)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-black/5 text-gray-500 text-xs font-medium transition-all duration-200 cursor-pointer">
              <MessageCircle size={12} />
              Responder
            </button>
          </>
        )}
      </div>

      {/* Ver respostas */}
      {Array.isArray(answers) && answers.length > 0 && (
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="text-xs font-semibold text-secondary hover:underline cursor-pointer self-start">
          {showAnswers
            ? "Ocultar respostas"
            : `Ver ${answers.length} ${answers.length > 1 ? "respostas" : "resposta"}`}
        </button>
      )}

      <AnimatePresence>
        {showAnswers && Array.isArray(answers) && answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 pl-3 border-l-2 border-secondary/20 ml-1">
            {answers
              .filter((a) => a && typeof a.text === "string")
              .map((answer) => {
                const isAnswerLiked = answer.has_reacted || false;
                const answerLikes = answer.like || 0;
                return (
                  <motion.div
                    key={answer.id || Math.random()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {answer.profile_picture && (
                        <Image
                          src={getProfilePictureUrl(answer.profile_picture)}
                          width={20}
                          height={20}
                          unoptimized
                          alt="Perfil"
                          className="rounded-full object-cover w-5 h-5"
                        />
                      )}
                      <span className="text-[11px] text-gray-400">
                        {answer.anon_name || "Anônimo"} •{" "}
                        <TimeAgo
                          date={answer.created_at || new Date()}
                          formatter={customFormatter}
                        />
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{answer.text}</p>
                    {isAuthenticated() && (
                      <button
                        onClick={() =>
                          handleAnswerLike(answer.id, isAnswerLiked)
                        }
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium w-fit transition-all duration-200 cursor-pointer ${
                          isAnswerLiked
                            ? "bg-secondary/15 text-secondary"
                            : "hover:bg-black/5 text-gray-400"
                        }`}>
                        <Heart
                          size={10}
                          className={isAnswerLiked ? "fill-current" : ""}
                        />
                        {isAnswerLiked ? "Apoiou" : "Apoiar"}
                        {answerLikes > 0 && (
                          <span className="opacity-60">({answerLikes})</span>
                        )}
                      </button>
                    )}
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário de resposta */}
      {replyMode && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 mt-1">
          <textarea
            placeholder="Escreva a sua resposta..."
            {...register("text", { required: true })}
            className="glass-input text-xs resize-none"
            style={{ borderRadius: "10px", fontSize: "0.8rem" }}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setReplyMode(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-black/5 transition-colors duration-200 cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors duration-200 flex items-center justify-center min-w-16"
              style={{ background: "#85cc84" }}>
              {loading ? (
                <div className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                "Responder"
              )}
            </button>
          </div>
        </motion.form>
      )}
    </li>
  );
}

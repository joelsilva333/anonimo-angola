/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PostCommentInterface } from "@/app/interfaces/comments";
import { customFormatter } from "@/app/utils/customFormatter";
import { EllipsisVertical, MessageCircle, Heart } from "lucide-react";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "@/app/api/config";
import { motion, AnimatePresence } from "framer-motion";

interface ReplyInput {
  text: string;
}

export default function Comment({
  comment,
  refetch,
}: {
  comment: PostCommentInterface;
  refetch: (options?: any) => void;
}) {
  const [replyMode, setReplyMode] = useState(false);
  const [answers, setAnswers] = useState(comment.answer || []);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(false)

  const { register, reset, handleSubmit } = useForm<ReplyInput>();

  const onSubmit: SubmitHandler<ReplyInput> = async (data) => {
    try {
      setLoading(true)
      const response = await api.post(`/answers/${comment.id}`, data);
      refetch();

      if (response.status === 201 && response.data?.answer) {
        const newAnswer = response.data.answer;
        setAnswers((prev) => [newAnswer, ...prev]);
        setShowAnswers(true);
      }
    } catch (error) {
      console.error("Erro ao responder:", error);
    } finally {
      setLoading(false)
      reset();
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <li className="w-full flex flex-col gap-2 bg-gray-50 p-4 rounded-md items-start hover:bg-gray-100 transition-colors duration-300">
      <div className="flex gap-2 max-lg:text-sm items-center justify-between w-full">
        <span className="flex gap-3 items-center">
          {comment.profile_picture && (
            <Image
              src={comment.profile_picture}
              width={300}
              height={300}
              unoptimized
              alt="Profile Picture"
              className="rounded-full bg-gray-300 w-8 h-8"
            />
          )}

          <span className="flex gap-1 items-center">
            <p className="text-sm font-semibold">{comment.anon_name}</p>
            <span className="text-xs">•</span>
            <p className="max-lg:text-xs text-sm text-[#757575]">
              <TimeAgo
                date={comment.created_at}
                formatter={customFormatter}
              />
            </p>
          </span>
        </span>

        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
          <EllipsisVertical className="text-[#757575] w-5" />
        </button>
      </div>

      <p className="text-sm">{comment.text}</p>

      <div className="flex items-center w-full font-semibold text-sm">
        <button className="flex justify-center items-center px-3 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-2 cursor-pointer">
          <Heart className="w-4" />
          <span className="max-lg:text-sm max-lg:hidden">Apoiar</span>
        </button>

        <button
          onClick={() => setReplyMode(!replyMode)}
          className="flex justify-center items-center px-3 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-2 cursor-pointer">
          <MessageCircle className="w-4" />
          <span className="max-lg:text-sm max-lg:hidden">Responder</span>
        </button>
      </div>

      {Array.isArray(answers) && answers.length > 0 && (
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="ml-4 font-semibold text-sm text-secondary hover:underline cursor-pointer">
          {showAnswers
            ? "Ocultar respostas"
            : `Ver ${answers.length} ${
                answers.length > 1 ? "respostas" : "resposta"
              }`}
        </button>
      )}

      <AnimatePresence>
        {showAnswers && Array.isArray(answers) && answers.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="w-full mt-2 flex flex-col gap-4">
            {answers
              .filter((a) => a && typeof a.text === "string")
              .map((answer) => (
                <motion.div
                  key={answer.id || Math.random()}
                  variants={item}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-1 ml-4 pl-3 border-l-2 border-gray-200">
                  <div className="flex items-center gap-2 mt-1">
                    {answer.profile_picture && (
                      <Image
                        src={answer.profile_picture}
                        width={24}
                        height={24}
                        unoptimized
                        alt="Answer Profile Picture"
                        className="rounded-full bg-gray-300"
                      />
                    )}
                    <span className="text-xs text-gray-600">
                      {answer.anon_name || "Anônimo"} •{" "}
                      <TimeAgo
                        date={answer.created_at || new Date()}
                        formatter={customFormatter}
                      />
                    </span>
                  </div>
                  <p className="text-sm">{answer.text}</p>

                  <div className="flex items-center w-full font-semibold max-lg:text-xs text-xs">
                    <button className="flex justify-center items-center px-2 py-0 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-1 cursor-pointer">
                      <Heart className="w-3" />
                      <span className="max-lg:hidden">Apoiar</span>
                    </button>

                    <button
                      onClick={() => setReplyMode(!replyMode)}
                      className="flex justify-center items-center px-2 py-0 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-1 cursor-pointer">
                      <MessageCircle className="w-3" />
                      <span className="max-lg:hidden">Responder</span>
                    </button>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {replyMode && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-2 mt-2">
          <textarea
            placeholder="Escreva a sua resposta..."
            {...register("text", { required: true })}
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
            rows={2}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setReplyMode(false);
              }}
              className="px-3 py-2 flex text-center items-center justify-center rounded-md bg-gray-200 text-sm hover:bg-gray-300 transition-colors duration-300 cursor-pointer">
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 flex text-center items-center justify-center rounded-md bg-secondary text-white text-sm hover:bg-secondary/75 transition-colors duration-300 cursor-pointer w-24">
             {
              loading ?<div className="w-5 h-5 rounded-full border-t-2 border border-l-2 border-gray-100 animate-spin"></div>   : "Responder"
             }
            </button>
          </div>
        </motion.form>
      )}
    </li>
  );
}

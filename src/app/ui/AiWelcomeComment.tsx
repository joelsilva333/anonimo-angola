"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import TimeAgo from "react-timeago";
import { customFormatter } from "@/app/utils/customFormatter";
import { PostCommentInterface } from "@/app/interfaces/comments";

/**
 * Card/balão de resposta diferenciado exibido como a primeira resposta de um
 * desabafo: a mensagem de acolhimento gerada automaticamente pela IA
 * (Gemini), claramente identificada para nunca ser confundida com uma
 * pessoa real.
 */
export default function AiWelcomeComment({
  comment,
}: {
  comment: PostCommentInterface;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2 p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(133,204,132,0.14), rgba(133,204,132,0.05))",
        border: "1px solid rgba(133,204,132,0.30)",
        borderRadius: "16px",
        fontFamily: "'Raleway', sans-serif",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            style={{ background: "#85cc84", color: "#fff" }}
          >
            <Sparkles size={14} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">
              Anônimo Angola IA
            </span>
            <span className="tag" style={{ width: "fit-content" }}>
              Acolhimento Automático IA
            </span>
          </span>
        </span>
        <span className="text-xs text-gray-400 shrink-0">
          <TimeAgo date={comment.created_at} formatter={customFormatter} />
        </span>
      </div>

      <p className="text-sm leading-relaxed text-gray-800 pl-10">
        {comment.text}
      </p>
    </motion.li>
  );
}

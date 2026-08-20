"use client";

import { Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { customFormatter } from "@/app/utils/customFormatter";
import useGetSimilarPosts from "@/app/hooks/get-similar-posts";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";

/**
 * Matching Inteligente por Afinidade: mostra 2-3 desabafos com temas ou
 * sentimentos semelhantes ao post actual, identificados via embeddings do
 * Gemini. Aparece na página do desabafo.
 */
export default function SimilarPosts({ postId }: { postId: string }) {
  const { similarPosts, loading } = useGetSimilarPosts(postId);

  if (loading || similarPosts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="w-full flex flex-col gap-3"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      <div className="flex items-center gap-3">
        <Sparkles size={14} style={{ color: "#85cc84" }} />
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "rgba(30,30,30,0.45)" }}
        >
          Relatos semelhantes que podes querer ler
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
      </div>

      <div className="flex flex-col gap-3">
        {similarPosts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <motion.div
              whileHover={{ y: -2 }}
              className="w-full flex flex-col gap-2 p-4 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.38)",
                borderRadius: "18px",
                boxShadow: "0 2px 12px rgba(30,30,30,0.05)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {post.profile_picture && (
                    <Image
                      src={getProfilePictureUrl(post.profile_picture)}
                      width={26}
                      height={26}
                      unoptimized
                      alt=""
                      className="rounded-full object-cover w-[26px] h-[26px]"
                    />
                  )}
                  <span className="text-xs font-semibold text-gray-800">
                    {post.anon_name}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock size={10} />
                  <TimeAgo date={post.created_at} formatter={customFormatter} />
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {post.text}
              </p>

              {post.theme_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {post.theme_tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

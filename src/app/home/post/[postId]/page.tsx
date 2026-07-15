"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import useGetPostById from "@/app/hooks/get-post-by-id";
import Post from "@/app/ui/Post";
import { use } from "react";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const router = useRouter();
  const { postId } = use(params);

  const { post, error, loading, refetch } = useGetPostById(postId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm animate-pulse">
          A carregar o desabafo...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-lg:px-2">
        <div className="bg-secondary/50 p-4 rounded-full text-secondary mb-4">
          <MessageCircle size={40} />
        </div>
        <h3 className="text-xl font-semibold">
          Desabafo não encontrado
        </h3>
        <p className=" text-sm mt-2 max-w-sm">
          O link pode estar partido ou o desabafo foi apagado pelo autor.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
          <ArrowLeft size={16} /> Voltar para a Home
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm font-medium mb-6 transition-colors duration-200">
        <ArrowLeft
          size={18}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar</span>
      </button>

      <main>
        <Post
          post={post}
          refetch={refetch}
        />
      </main>
    </motion.div>
  );
}

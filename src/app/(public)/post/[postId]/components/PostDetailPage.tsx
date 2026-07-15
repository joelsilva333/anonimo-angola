"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import useGetPostById from "@/app/hooks/get-post-by-id";
import Post from "@/app/ui/Post";

export default function PostDetailPageClient({ postId }: { postId: string }) {
  const router = useRouter();

  const { post, error, loading, refetch } = useGetPostById(postId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">A carregar o desabafo...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-secondary/80 p-4 rounded-full text-white mb-4">
          <MessageCircle size={40} />
        </div>
        <h3 className="text-2xl font-semibold">Desabafo não encontrado</h3>
        <p className="mt-2 max-w-sm">
          O link pode estar partido ou o desabafo foi apagado pelo autor.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center gap-2 cursor-pointer hover:scale-105 font-medium text-secondary/90 hover:text-secondary transition-all duration-300">
          <ArrowLeft size={16} /> Voltar para as postagens
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
      className="w-full max-w-2xl mx-auto max-lg:px-2 px-4 py-6">
      <button
        onClick={() => router.push("/")}
        className="group flex items-center gap-2 hover:text-primary/80 font-medium mb-6 transition-colors duration-200 cursor-pointer">
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

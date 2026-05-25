"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import useGetPostById from "@/app/hooks/get-post-by-id";
import Post from "../../ui/Post";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Extrai o postId de forma segura a partir dos parâmetros da URL
  const postId = params.postId as string;
  const { post, loading, error, refetch } = useGetPostById(postId);

  console.log(post);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-10 h-10 rounded-full border-t-2 border border-l-2 border-secondary animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full text-center py-20 flex flex-col gap-4 items-center">
        <p className="text-lg text-gray-600">
          {error || "Desabafo não encontrado."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-all cursor-pointer">
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Botão de Voltar Fluido */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex justify-start pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200 font-medium text-sm cursor-pointer group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          Voltar aos desabafos
        </button>
      </motion.div>

      {/* Título da Página de Detalhe */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full text-left pb-2 mt-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-800">
          Desabafo de {post.user}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full">
        <Post
          post={post}
          refetch={refetch}
        />
      </motion.div>
    </>
  );
}

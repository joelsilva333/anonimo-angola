"use client";

import { X, Sparkles, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "../api/config";
import { useUser } from "../hooks/user";
import { toast, ToastContainer } from "react-toastify";
import { useGetPosts } from "../hooks/post";
import { motion, AnimatePresence } from "framer-motion";
import Post from "../ui/Post";
import { getProfilePictureUrl } from "../utils/getProfilePicture";

interface FormData { text: string; }

const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.38)",
  borderRadius: "24px",
  boxShadow: "0 4px 24px rgba(30,30,30,0.06)",
};

export default function Home() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const { posts, refetch } = useGetPosts();
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1000;

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<FormData>();
  const textValue = watch("text", "");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user?.id) { toast.error("Você precisa estar logado para postar."); return; }
    try {
      setLoading(true);
      const response = await api.post(`/posts`, data);
      if (response.status === 201) {
        refetch({ optimisticPosts: (prev) => [response.data, ...prev] });
        reset();
        setCharCount(0);
        setModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao criar post. Tente novamente.");
    } finally { setLoading(false); }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <>
      <ToastContainer theme="colored" />

      {/* ── Hero Section ── */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex flex-col items-center gap-4 pt-10 pb-6 text-center"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        {/* Badge "seguro + anónimo" */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
          style={{
            background: "rgba(133,204,132,0.16)",
            color: "#3d9c3c",
            border: "1px solid rgba(133,204,132,0.32)",
          }}
        >
          <ShieldCheck size={12} />
          100% Anónimo · Sem Julgamentos
        </motion.span>

        <h1
          className="text-4xl max-lg:text-3xl leading-tight"
          style={{ fontWeight: 700, color: "#1e1e1e", letterSpacing: "-0.02em" }}
        >
          Sinta-se à vontade para{" "}
          <span style={{ color: "#85cc84" }}>desabafar</span>.
        </h1>

        <p
          className="text-base max-lg:text-sm max-w-md leading-relaxed"
          style={{ color: "rgba(30,30,30,0.58)", fontWeight: 400 }}
        >
          Estamos aqui para ouvir. A sua voz importa, mesmo que seja anônima.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <Link href="/register" className="btn-primary" style={{ width: "auto", padding: "10px 24px", fontSize: "0.875rem" }}>
            Criar perfil anônimo grátis
          </Link>
          <Link href="/login" className="btn-secondary" style={{ width: "auto", padding: "10px 24px", fontSize: "0.875rem" }}>
            Entrar na conta
          </Link>
        </div>
      </motion.section>

      {/* ── Separador: últimos desabafos ── */}
      <div className="w-full flex items-center gap-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
        <Sparkles size={14} style={{ color: "#85cc84" }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(30,30,30,0.45)" }}>
          Últimos Desabafos
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
      </div>

      {/* ── Feed ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full flex flex-col gap-4"
      >
        {posts.map((post) => (
          <motion.div key={post.id} variants={item}>
            <Post post={post} refetch={refetch} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Modal: Novo Desabafo ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)" }}
          >
            <motion.form
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-xl flex flex-col gap-4 p-6"
              style={{
                background: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.55)",
                borderRadius: "28px",
                boxShadow: "0 24px 64px rgba(30,30,30,0.20)",
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              {/* Header do modal */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  {user?.profile_picture && (
                    <Image
                      src={getProfilePictureUrl(user.profile_picture)}
                      width={38} height={38} unoptimized alt=""
                      className="rounded-full object-cover w-10 h-10"
                      style={{ border: "2px solid rgba(133,204,132,0.35)" }}
                    />
                  )}
                  <p className="font-semibold text-gray-800">{user?.anon_name}</p>
                </span>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
                  onClick={() => setModalOpen(false)}
                >
                  <X size={18} className="text-gray-500" />
                </motion.button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={7}
                  autoFocus
                  disabled={loading}
                  {...register("text", {
                    required: "O texto é obrigatório",
                    maxLength: { value: MAX_CHARS, message: `Máximo de ${MAX_CHARS} caracteres.` },
                  })}
                  onChange={(e) => setCharCount(e.target.value.length)}
                  className="w-full resize-none outline-none text-base leading-relaxed"
                  placeholder="Esteja à vontade para desabafar aqui..."
                  style={{
                    background: "rgba(240,242,240,0.60)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 400,
                    color: "#1e1e1e",
                  }}
                />
                {/* Contador */}
                <span
                  className="absolute bottom-3 right-4 text-xs"
                  style={{ color: charCount > MAX_CHARS * 0.9 ? "#ef4444" : "rgba(30,30,30,0.35)", fontFamily: "'Raleway', sans-serif" }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
              {errors.text && <p className="text-xs text-red-500">{errors.text.message}</p>}

              {/* Botão enviar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  "Partilhar Desabafo"
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

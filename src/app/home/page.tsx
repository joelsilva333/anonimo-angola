"use client";

import { X, Sparkles, PenLine } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "../api/config";
import { useUser } from "../hooks/user";
import { toast, ToastContainer } from "react-toastify";
import Post from "../ui/Post";
import SponsorBanner from "../ui/SponsorBanner";
import { useGetPosts } from "../hooks/post";
import { useGetSponsors } from "../hooks/get-sponsors";
import { motion, AnimatePresence } from "framer-motion";
import { getProfilePictureUrl } from "../utils/getProfilePicture";

const POSTS_BETWEEN_SPONSORS = 4;
interface FormData { text: string; }

const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.38)",
  borderRadius: "24px",
  boxShadow: "0 4px 24px rgba(30,30,30,0.06)",
};

const MAX_CHARS = 1000;

export default function Home() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const { posts, refetch } = useGetPosts();
  const { sponsors } = useGetSponsors();
  const [charCount, setCharCount] = useState(0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao criar post. Tente novamente.");
    } finally { setLoading(false); }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <>
      <ToastContainer theme="colored" />

      {/* ── Saudação ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex flex-col gap-1 pt-8 max-lg:text-center"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        <h1 className="text-3xl max-lg:text-2xl" style={{ fontWeight: 700, color: "#1e1e1e", letterSpacing: "-0.01em" }}>
          Olá, <span style={{ color: "#85cc84" }}>{user?.anon_name || "Anônimo"}</span> 👋
        </h1>
        <p className="text-sm" style={{ color: "rgba(30,30,30,0.52)", fontWeight: 400 }}>
          Como se sente hoje? Partilhe um desabafo com a comunidade.
        </p>
      </motion.div>

      {/* ── Caixa de Desabafo ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        whileHover={{ y: -2 }}
        className="w-full p-5 cursor-pointer"
        style={glassCard}
        onClick={() => setModalOpen(true)}
      >
        <div className="flex items-center gap-3">
          {user?.profile_picture && (
            <Image
              src={getProfilePictureUrl(user.profile_picture)}
              width={40} height={40} unoptimized alt=""
              className="rounded-full object-cover w-10 h-10 shrink-0"
              style={{ border: "2px solid rgba(133,204,132,0.35)" }}
            />
          )}
          <span
            className="flex-1 text-base max-lg:text-sm py-2.5 px-4 rounded-2xl"
            style={{
              background: "rgba(240,242,240,0.55)",
              border: "1px solid rgba(0,0,0,0.07)",
              color: "rgba(30,30,30,0.38)",
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 400,
            }}
          >
            Esteja à vontade para desabafar aqui...
          </span>
          <span
            className="p-2.5 rounded-xl shrink-0"
            style={{ background: "rgba(133,204,132,0.18)", color: "#3d9c3c" }}
          >
            <PenLine size={16} />
          </span>
        </div>
      </motion.div>

      {/* ── Separador ── */}
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
        {posts.map((post, index) => {
          const sponsorSlot =
            sponsors.length > 0 && index > 0 && index % POSTS_BETWEEN_SPONSORS === 0
              ? sponsors[(index / POSTS_BETWEEN_SPONSORS - 1) % sponsors.length]
              : null;
          return (
            <motion.div key={post.id} variants={item} className="w-full flex flex-col gap-4">
              {sponsorSlot && <SponsorBanner sponsor={sponsorSlot} />}
              <Post post={post} refetch={refetch} />
            </motion.div>
          );
        })}
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
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{user?.anon_name}</p>
                    <p className="text-xs text-gray-400">Partilhando anonimamente</p>
                  </div>
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

              <div className="relative">
                <textarea
                  rows={7} autoFocus disabled={loading}
                  {...register("text", {
                    required: "O texto é obrigatório",
                    maxLength: { value: MAX_CHARS, message: `Máximo de ${MAX_CHARS} caracteres.` },
                  })}
                  onChange={(e) => setCharCount(e.target.value.length)}
                  className="w-full resize-none outline-none text-base leading-relaxed"
                  placeholder="Esteja à vontade para desabafar aqui..."
                  style={{
                    background: "rgba(240,242,240,0.55)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    fontFamily: "'Raleway', sans-serif",
                    color: "#1e1e1e",
                  }}
                />
                <span
                  className="absolute bottom-3 right-4 text-xs"
                  style={{ color: charCount > MAX_CHARS * 0.9 ? "#ef4444" : "rgba(30,30,30,0.35)" }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
              {errors.text && <p className="text-xs text-red-500">{errors.text.message}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : "Partilhar Desabafo"}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

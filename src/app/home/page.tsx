"use client";

import { X } from "lucide-react";
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

interface FormData {
  text: string;
}

export default function Home() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const { posts, refetch } = useGetPosts();
  const { sponsors } = useGetSponsors();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para postar.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/posts`, data);

      if (response.status === 201) {
        const newPost = response.data;

        refetch({
          optimisticPosts: (prevPosts) => [newPost, ...prevPosts],
        });

        reset();
        setModalOpen(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Erro ao criar post. Por favor, tente novamente.",
      );
    } finally {
      setLoading(false);
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <ToastContainer />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex-col flex items-center gap-2 py-8 max-lg:text-center">
        <h1 className="text-4xl font-bold max-lg:text-3xl">
          Seja bem-vindo ao Anônimo Angola.
        </h1>
        <p className="text-lg text-gray-700 ">
          Esta é a sua plataforma para partilhar e descobrir histórias anônimas.
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-4">
          {user?.profile_picture && (
            <Image
              src={getProfilePictureUrl(user.profile_picture)}
              width={44}
              height={44}
              unoptimized
              alt=""
              className="rounded-full bg-gray-500"
            />
          )}
          <span className="text-lg font-semibold">{user?.anon_name}</span>
        </div>

        <button
          onClick={() => setModalOpen(!modalOpen)}
          className="text-xl max-lg:text-lg text-gray-500 w-fit cursor-text text-left">
          Esteja à vontade para desabafar aqui...
        </button>
      </motion.div>

      <h1 className="text-lg font-bold text-left w-full">ÚLTIMOS DESABAFOS</h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full flex flex-col gap-4">
        {posts.map((post, index) => {
          const sponsorSlot =
            sponsors.length > 0 && index > 0 && index % POSTS_BETWEEN_SPONSORS === 0
              ? sponsors[(index / POSTS_BETWEEN_SPONSORS - 1) % sponsors.length]
              : null;

          return (
            <motion.div
              key={post.id}
              variants={item}
              className="w-full flex flex-col gap-4">
              {sponsorSlot && <SponsorBanner sponsor={sponsorSlot} />}
              <Post
                post={post}
                refetch={refetch}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed h-screen w-full top-0 flex justify-center items-center bg-white/80 p-4 z-50">
            <ToastContainer />
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 shadow-lg max-w-2xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-4">
                  {user?.profile_picture && (
                    <Image
                      src={getProfilePictureUrl(user.profile_picture)}
                      width={44}
                      height={44}
                      unoptimized
                      alt=""
                      className="rounded-full bg-gray-500"
                    />
                  )}
                  <p className="text-lg font-semibold">{user?.anon_name}</p>
                </span>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
                  onClick={() => setModalOpen(false)}>
                  <X className="text-gray-500" />
                </motion.button>
              </div>

              <div className="w-full">
                <textarea
                  rows={8}
                  autoFocus
                  disabled={loading}
                  {...register("text", {
                    required: "O texto é obrigatório",
                  })}
                  className="text-xl text-gray-500 w-full cursor-text resize-none bg-transparent outline-none"
                  placeholder="Esteja à vontade para desabafar aqui..."></textarea>
                {errors.text && (
                  <p className="text-sm text-red-500">{errors.text.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center bg-primary text-lg font-semibold text-white px-4 py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 cursor-pointer w-full">
                {loading ? (
                  <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
                ) : (
                  "Postar"
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

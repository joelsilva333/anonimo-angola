"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "../api/config";
import { useUser } from "../hooks/user";
import { toast, ToastContainer } from "react-toastify";
import Post from "./ui/Post";
import { useGetPosts } from "../hooks/post";
import { PostInterface } from "../interfaces/post";

interface FormData {
  text: string;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const { posts } = useGetPosts();
  const [myPosts, setMyPosts] = useState<PostInterface[]>([]);

  const combinedPosts = [...myPosts, ...posts];

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
      const response = await api.post(`/posts/${user?.id}`, data);

      if (response.status === 201) {
        const newPost = response.data;
        setMyPosts((prev) => [newPost, ...prev]);
        toast.success("Desabafo criado com sucesso.");
        reset();
        setTimeout(() => setMenuOpen(false), 2000);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Erro ao criar post. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full flex-col flex items-center gap-2 py-8 max-lg:text-center">
        <h1 className="text-4xl font-bold max-lg:text-3xl">
          Seja bem-vindo ao Anônimo Angola.
        </h1>
        <p className="text-lg text-gray-700 ">
          Esta é a sua plataforma para partilhar e descobrir histórias anônimas.
        </p>
      </div>

      <div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-4">
          {user?.profile_picture && (
            <Image
              src={user.profile_picture}
              width={44}
              height={44}
              alt=""
              className="rounded-full bg-gray-500"
            />
          )}

          <span className="text-lg font-semibold">{user?.anon_name}</span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl max-lg:text-lg text-gray-500 w-fit cursor-text">
          Esteja à vontade para desabafar aqui...
        </button>
      </div>

      <h1 className="text-lg font-bold text-left w-full">ÚLTIMOS DESABAFOS</h1>

      {combinedPosts.length > 0 ? (
        combinedPosts.map((post, index) => (
          <Post
            key={index}
            post={post}
          />
        ))
      ) : (
        <p className="text-gray-500">Nenhum desabafo encontrado.</p>
      )}

      {menuOpen && (
        <div className="fixed h-screen w-full top-0 flex justify-center items-center bg-white/80 p-4 z-50">
          <ToastContainer />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 shadow-lg transition-shadow duration-300 max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-4">
                {user?.profile_picture && (
                  <Image
                    src={user.profile_picture}
                    width={44}
                    height={44}
                    alt=""
                    className="rounded-full bg-gray-500"
                  />
                )}
                <p className="text-lg font-semibold">{user?.anon_name}</p>
              </span>

              <button
                type="button"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
                onClick={() => setMenuOpen(false)}>
                <X className="text-gray-500" />
              </button>
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

            <button className="flex items-center justify-center bg-[#1E1E1E] text-lg font-semibold text-white px-4 py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 cursor-pointer w-full">
              {loading ? (
                <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
              ) : (
                "Postar"
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

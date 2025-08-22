"use client";
import { api } from "@/app/api/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState<boolean>();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        anon_name: data.username,
        password: data.password,
      });

      if (response.status === 201) {
        toast.success("Perfil criado com sucesso");
        router.push("/login");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        "Erro ao criar perfil. Por favor, tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8">
      <ToastContainer />
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}>
        <h1 className="font-semibold text-3xl">Criar Perfil</h1>
        <div>
          <label className="flex flex-col gap-2 w-full">
            <p>
              {" "}
              Identificador Anônimo{" "}
              <span className="text-xs text-red-400">
                * Não use o seu verdadeiro nome!
              </span>
            </p>
            <input
              {...register("username", {
                required: "O identificador é obrigatório",
                validate: {
                  semAcentos: (value) =>
                    /^[\x00-\x7F]*$/.test(value) || "Não deve conter acentos",
                  semEspacos: (value) =>
                    !/\s/.test(value) || "Não deve conter espaços",
                  temNumero: (value) =>
                    /\d/.test(value) || "Deve conter pelo menos um número",
                  apenasMinusculas: (value) =>
                    /^[a-z0-9_]+$/.test(value) ||
                    "Apenas letras minúsculas, números e sublinhados são permitidos",
                  tamanho: (value) =>
                    (value.length >= 5 && value.length <= 12) ||
                    "O identificador deve ter entre 5 e 12 caracteres",
                },
              })}
              placeholder="Ex: anonimo123"
              type="text"
              name="username"
              className="w-full bg-white rounded-md px-4 py-2 outline-none"
            />
          </label>

          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="flex flex-col gap-2 w-full">
            Palavra-passe
            <input
              {...register("password", {
                required: "A palavra-passe é obrigatória",
                minLength: {
                  value: 8,
                  message: "A palavra-passe deve ter pelo menos 8 caracteres.",
                },
              })}
              type="password"
              name="password"
              placeholder="*********"
              className="w-full bg-white rounded-md px-4 py-2 outline-none"
            />
          </label>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="flex flex-col gap-2 w-full">
            Confirmar palavra-passe
            <input
              {...register("confirmPassword", {
                required: "A confirmação da palavra-passe é obrigatória",
                validate: (value) =>
                  value === watch("password") ||
                  "As palavras-passe não coincidem",
              })}
              type="password"
              name="confirmPassword"
              placeholder="*********"
              className="w-full bg-white rounded-md px-4 py-2 outline-none"
            />
          </label>

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col w-full">
          <button
            disabled={loading}
            type="submit"
            className="bg-[#1E1E1E] h-12 flex justify-center items-center text-white px-4 py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 cursor-pointer w-full">
            {loading ? (
              <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
            ) : (
              "Criar Perfil"
            )}
          </button>

          <Link
            href="/login"
            className="text-center text-[#1E1E1E] mt-2 hover:underline">
            Já tem uma conta?{" "}
            <span className="font-semibold hover:text-[#333333] transition-colors duration-300">
              Entrar
            </span>
          </Link>
        </div>
      </form>
    </div>
  );
}

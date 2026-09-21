/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { api } from "@/app/api/config";
import { auth } from "@/app/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Lock, CheckCircle2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const inputStyle = (icon = true): React.CSSProperties => ({
  width: "100%",
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "14px",
  padding: icon ? "11px 16px 11px 40px" : "11px 16px",
  outline: "none",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "0.875rem",
  color: "#1e1e1e",
  transition: "all 0.2s",
});

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  color: "#1e1e1e",
  pointerEvents: "none",
  top: "50%",
  transform: "translateY(-50%)",
};

export default function Register() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleConnectGoogle = async () => {
    try {
      setGoogleLoading(true);
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();
      setGoogleToken(idToken);
      toast.success(
        "Conta Google conectada! Termina o registo abaixo para vincular.",
      );
    } catch (error: any) {
      console.error("Erro ao conectar com o Google:", error);
      if (error?.code === "auth/popup-closed-by-user") {
        // O utilizador fechou o popup — não é um erro, não mostra toast.
        return;
      }
      toast.error(
        error?.code
          ? `Não foi possível conectar com o Google (${error.code}).`
          : "Não foi possível conectar com o Google. Tenta novamente.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      await api.post("/auth/register", {
        anon_name: data.username,
        password: data.password,
        google_token: googleToken || undefined,
      });
      toast.success("Perfil criado com sucesso!");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao criar perfil. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full p-8 max-lg:px-6 max-lg:py-6"
      style={{ fontFamily: "'Raleway', sans-serif" }}>
      {/* Logo mobile */}
      <div className="flex justify-center mb-6 lg:hidden">
        <Image
          src="/logos/bg-none.png"
          width={120}
          height={44}
          unoptimized
          alt="Anônimo Angola"
          className="w-28 object-contain"
        />
      </div>

      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1 max-lg:text-center">
          <h1 className="font-bold text-2xl text-gray-900">
            Criar Perfil Anônimo
          </h1>
          <p className="text-xs text-gray-400">
            Junte-se à comunidade. A sua identidade está protegida.
          </p>
        </div>

        {/* Google (opcional): liga a conta já na criação para login rápido depois */}
        {googleToken ? (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium">
            <CheckCircle2 size={16} />
            Conta Google conectada — será vinculada ao concluíres o registo
          </div>
        ) : (
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleConnectGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-semibold text-sm text-gray-700 cursor-pointer transition-colors duration-200 hover:bg-black/5"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(0,0,0,0.10)",
            }}>
            {googleLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-gray-400/40 border-t-gray-600 animate-spin" />
            ) : (
              <>
                <FcGoogle size={18} />
                Continuar com Google (opcional)
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs text-gray-400">ou preenche abaixo</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* Identificador */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Identificador Anônimo{" "}
            <span className="text-xs text-red-400 font-normal">
              * Não uses o teu nome real
            </span>
          </label>
          <div className="relative">
            <User
              size={16}
              style={iconStyle}
            />
            <input
              {...register("username", {
                required: "O identificador é obrigatório",
                validate: {
                  semAcentos: (v) =>
                    /^[\x00-\x7F]*$/.test(v) || "Não deve conter acentos",
                  semEspacos: (v) => !/\s/.test(v) || "Não deve conter espaços",
                  temNumero: (v) =>
                    /\d/.test(v) || "Deve conter pelo menos um número",
                  apenasMinusculas: (v) =>
                    /^[a-z0-9_]+$/.test(v) ||
                    "Apenas letras minúsculas, números e _",
                  tamanho: (v) =>
                    (v.length >= 5 && v.length <= 24) ||
                    "Entre 5 e 24 caracteres",
                },
              })}
              placeholder="Ex: anonimo123"
              type="text"
              style={inputStyle()}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-red-500">{errors.username.message}</p>
          )}
          <p className="text-xs text-gray-400">
            Verificamos com IA se o nome não parece identificar-te.
          </p>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Palavra-passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              style={iconStyle}
            />
            <input
              {...register("password", {
                required: "A palavra-passe é obrigatória",
                minLength: { value: 8, message: "Mínimo 8 caracteres." },
              })}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              style={{ ...inputStyle(), paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(30,30,30,0.38)",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Confirmar palavra-passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              style={iconStyle}
            />
            <input
              {...register("confirmPassword", {
                required: "A confirmação é obrigatória",
                validate: (v) =>
                  v === watch("password") || "As palavras-passe não coincidem",
              })}
              type={showConfirmPw ? "text" : "password"}
              placeholder="••••••••"
              style={{ ...inputStyle(), paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw(!showConfirmPw)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(30,30,30,0.38)",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}>
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 -mt-1">
          Podes associar um número de telefone de recuperação mais tarde, nas
          Definições — não é preciso agora para criar a conta.
        </p>

        <div className="flex flex-col gap-3 mt-1">
          <button
            disabled={loading}
            type="submit"
            className="btn-primary">
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              "Criar Perfil"
            )}
          </button>
          <p className="text-center text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-secondary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

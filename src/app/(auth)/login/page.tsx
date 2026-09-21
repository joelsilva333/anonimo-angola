"use client";

import { api } from "@/app/api/config";
import { auth } from "@/app/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface FormData {
  username: string;
  password: string;
}

const inputWrap = {
  position: "relative" as const,
  display: "flex",
  alignItems: "center",
};

const iconStyle = {
  position: "absolute" as const,
  left: "14px",
  color: "rgba(30,30,30,0.35)",
  pointerEvents: "none" as const,
};

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "14px",
  padding: "11px 16px 11px 40px",
  outline: "none",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "0.875rem",
  color: "#1e1e1e",
  transition: "all 0.2s",
};

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = new Cookies();

  useEffect(() => {
    const suspended = searchParams.get("suspended");
    if (suspended) {
      toast.error(suspended);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();

      // Login ou registo instantâneo: se ainda não existir conta vinculada
      // a este Google, o backend cria uma na hora (sem senha, sem
      // telefone) — nunca fica bloqueado à espera de verificação.
      const response = await api.post("/auth/google/login", {
        firebase_token: idToken,
      });

      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      cookies.set("aa_token", response.data.token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      router.push(response.data.user.role === "admin" ? "/admin" : "/home");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro ao continuar com o Google:", error);

      if (error?.code === "auth/popup-closed-by-user") {
        // O utilizador fechou o popup — não é um erro, não mostra toast.
        return;
      }

      toast.error(
        error?.response?.data?.error ||
          (error?.code
            ? `Não foi possível continuar com o Google (${error.code}).`
            : "Não foi possível continuar com o Google. Tenta novamente."),
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", {
        anon_name: data.username,
        password: data.password,
      });
      if (response.status === 200) {
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
        cookies.set("aa_token", response.data.token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        router.push(response.data.user.role === "admin" ? "/admin" : "/home");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao fazer login. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full p-8 max-lg:px-6 max-lg:py-6"
      style={{ fontFamily: "'Raleway', sans-serif" }}>
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
        className="flex flex-col gap-5 w-full"
        onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1 max-lg:text-center">
          <h1 className="font-bold text-2xl text-gray-900">Iniciar Sessão</h1>
          <p className="text-xs text-gray-400">
            Bem-vindo de volta à comunidade anónima.
          </p>
        </div>

        {/* Identificador */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Identificador Anônimo
          </label>
          <div style={inputWrap}>
            <User
              size={16}
              style={iconStyle}
            />
            <input
              placeholder="Ex: anonimo_dds"
              {...register("username", {
                required: "O identificador é obrigatório",
              })}
              type="text"
              style={inputStyle}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Palavra-passe
          </label>
          <div style={{ ...inputWrap }}>
            <Lock
              size={16}
              style={iconStyle}
            />
            <input
              {...register("password", {
                required: "A palavra-passe é obrigatória",
              })}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                color: "rgba(30,30,30,0.38)",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-between items-center">
            {errors.password ? (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            ) : (
              <span />
            )}
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-secondary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3 mt-1">
          <button
            disabled={loading}
            type="submit"
            className="btn-primary">
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              "Entrar"
            )}
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleLogin}
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
                Continuar com Google
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-secondary hover:underline">
              Criar Perfil Grátis
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

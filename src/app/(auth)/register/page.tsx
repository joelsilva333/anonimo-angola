/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { api } from "@/app/api/config";
import { auth } from "@/app/lib/firebase";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

interface FormData {
  username: string;
  phone_number: string;
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

  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [otpCode, setOtpCode] = useState<string>("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => {
            toast.error("O reCAPTCHA expirou. Tente novamente.");
          },
        },
      );
    }
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(
        auth,
        data.phone_number.trim(),
        appVerifier,
      );

      setConfirmationResult(confirmation);
      setFormData(data);
      setStep("OTP");
      toast.info("Código de verificação enviado por SMS!");
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Erro ao enviar SMS. Verifique o número de telefone ou tente mais tarde.",
      );
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length < 6) {
      toast.error("Por favor, insira o código OTP de 6 dígitos.");
      return;
    }

    if (!confirmationResult || !formData) {
      toast.error("Sessão expirada. Volte e tente novamente.");
      setStep("FORM");
      return;
    }

    try {
      setLoading(true);

      // 1. Confirmar o código OTP no Firebase
      const userCredential = await confirmationResult.confirm(otpCode);

      // 2. Obter o ID Token de verificação do Firebase
      const idToken = await userCredential.user.getIdToken();

      // 3. Enviar para a rota do Backend com o firebase_token
      const response = await api.post("/auth/register", {
        anon_name: formData.username,
        phone_number: formData.phone_number,
        password: formData.password,
        firebase_token: idToken, // Enviado para o backend validar
      });

      if (response.status === 201) {
        toast.success("Perfil criado com sucesso!");
        router.push("/login");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.error ||
        "Código incorreto ou expirado. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md lg:p-8 px-8 py-4">
      <ToastContainer />

      {/* Contentor invisível exigido pelo Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {step === "FORM" ? (
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleSubmit(onSubmit)}>
          <h1 className="font-semibold text-3xl max-lg:text-center max-lg:text-2xl">
            Criar Perfil
          </h1>

          <div>
            <label className="flex flex-col gap-2 w-full">
              <p>
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
                      (value.length >= 5 && value.length <= 8) ||
                      "O identificador deve ter entre 5 e 8 caracteres",
                  },
                  maxLength: {
                    value: 8,
                    message: "O identificador deve ter no máximo 8 caracteres",
                  },
                })}
                placeholder="Ex: anonimo123"
                type="text"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>

            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex flex-col gap-2 w-full">
              Número de telefone
              <input
                {...register("phone_number", {
                  required: "O número de telefone é obrigatório",
                  pattern: {
                    value: /^\+244\d{9}$/,
                    message:
                      "O número de telefone deve estar no formato +244XXXXXXXXX",
                  },
                })}
                placeholder="Ex: +244923456789"
                type="text"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>

            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone_number.message}
              </p>
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
                    message:
                      "A palavra-passe deve ter pelo menos 8 caracteres.",
                  },
                })}
                type="password"
                placeholder="*********"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
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
                placeholder="*********"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <button
              disabled={loading}
              type="submit"
              className="btn-primary">
              {loading ? (
                <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
              ) : (
                "Continuar para Verificação"
              )}
            </button>

            <Link
              href="/login"
              className="text-center text-primary mt-2 hover:underline">
              Já tem uma conta?{" "}
              <span className="font-semibold hover:text-[#333333] transition-colors duration-300">
                Entrar
              </span>
            </Link>
          </div>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleVerifyOtp}>
          <h1 className="font-semibold text-3xl max-lg:text-center max-lg:text-2xl">
            Verificar Telemóvel
          </h1>
          <p className="text-sm text-gray-600">
            Enviámos um código SMS para o número{" "}
            <span className="font-semibold">{formData?.phone_number}</span>.
          </p>

          <div>
            <label className="flex flex-col gap-2 w-full">
              Código SMS (OTP)
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="INSIRA O CÓDIGO DE 6 DÍGITOS"
                className="w-full bg-white rounded-md px-4 py-2 outline-none text-center text-xl tracking-widest"
              />
            </label>
          </div>

          <div className="flex flex-col w-full gap-2">
            <button
              disabled={loading}
              type="submit"
              className="btn-primary">
              {loading ? (
                <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
              ) : (
                "Confirmar e Criar Perfil"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("FORM")}
              className="text-sm text-gray-500 hover:underline text-center mt-2">
              Voltar / Alterar Número
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
  }
}

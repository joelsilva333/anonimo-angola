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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Phone, Lock, CheckCircle2 } from "lucide-react";

interface FormData {
  username: string;
  phone_number: string;
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
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [otpCode, setOtpCode] = useState<string>("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () =>
            toast.error("O reCAPTCHA expirou. Tente novamente."),
        },
      );
    }
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(
        auth,
        data.phone_number.trim(),
        window.recaptchaVerifier,
      );
      setConfirmationResult(confirmation);
      setFormData(data);
      setStep("OTP");
      toast.info("Código de verificação enviado por SMS!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      toast.error(
        "Erro ao enviar SMS. Verifique o número ou tente mais tarde.",
      );
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier
          .render()
          .then((widgetId: any) => window.grecaptcha.reset(widgetId));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error("Insira o código OTP de 6 dígitos.");
      return;
    }
    if (!confirmationResult || !formData) {
      toast.error("Sessão expirada. Volte e tente novamente.");
      setStep("FORM");
      return;
    }
    try {
      setLoading(true);
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();
      const response = await api.post("/auth/register", {
        anon_name: formData.username,
        phone_number: formData.phone_number,
        password: formData.password,
        firebase_token: idToken,
      });
      if (response.status === 201) {
        toast.success("Perfil criado com sucesso!");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Código incorreto ou expirado.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full p-8 max-lg:px-6 max-lg:py-6"
      style={{ fontFamily: "'Raleway', sans-serif" }}>
      
      <div id="recaptcha-container" className="absolute bottom-20 right-20"/>

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

      {step === "FORM" ? (
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

          {/* Identificador */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Identificador Anônimo{" "}
              <span className="text-xs text-red-400 font-normal">
                * Não use o seu nome real
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
                    semEspacos: (v) =>
                      !/\s/.test(v) || "Não deve conter espaços",
                    temNumero: (v) =>
                      /\d/.test(v) || "Deve conter pelo menos um número",
                    apenasMinusculas: (v) =>
                      /^[a-z0-9_]+$/.test(v) ||
                      "Apenas letras minúsculas, números e _",
                    tamanho: (v) =>
                      (v.length >= 5 && v.length <= 8) ||
                      "Entre 5 e 8 caracteres",
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
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Número de telefone
            </label>
            <div className="relative">
              <Phone
                size={16}
                style={iconStyle}
              />
              <input
                {...register("phone_number", {
                  required: "O número é obrigatório",
                  pattern: {
                    value: /^\+244\d{9}$/,
                    message: "Formato: +244XXXXXXXXX",
                  },
                })}
                placeholder="+244923456789"
                type="text"
                style={inputStyle()}
              />
            </div>
            {errors.phone_number && (
              <p className="text-xs text-red-500">
                {errors.phone_number.message}
              </p>
            )}
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
                    v === watch("password") ||
                    "As palavras-passe não coincidem",
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

          <div className="flex flex-col gap-3 mt-1">
            <button
              disabled={loading}
              type="submit"
              className="btn-primary">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                "Continuar para Verificação"
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
      ) : (
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={handleVerifyOtp}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2
                size={20}
                className="text-secondary"
              />
              <h1 className="font-bold text-2xl text-gray-900">
                Verificar Número
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Enviámos um código SMS para{" "}
              <span className="font-semibold text-gray-700">
                {formData?.phone_number}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Código SMS (6 dígitos)
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="• • • • • •"
              style={{
                ...inputStyle(false),
                textAlign: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.5em",
                fontWeight: 700,
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={loading}
              type="submit"
              className="btn-primary">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                "Confirmar e Criar Perfil"
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep("FORM")}
              className="text-sm text-gray-400 hover:text-gray-600 text-center font-medium transition-colors cursor-pointer">
              ← Voltar / Alterar Número
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

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
import { toast } from "react-toastify";
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface PhoneFormData {
  phone_number: string;
}

interface ResetFormData {
  new_password: string;
  confirmPassword: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "14px",
  padding: "11px 16px",
  outline: "none",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "0.875rem",
  color: "#1e1e1e",
};

export default function ForgotPassword() {
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const router = useRouter();

  const phoneForm = useForm<PhoneFormData>();
  const resetForm = useForm<ResetFormData>();

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

  const onSubmitPhone: SubmitHandler<PhoneFormData> = async (data) => {
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(
        auth,
        data.phone_number.trim(),
        window.recaptchaVerifier,
      );
      setConfirmationResult(confirmation);
      setPhoneNumber(data.phone_number.trim());
      setStep("OTP");
      toast.info("Código de verificação enviado por SMS!");
    } catch {
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

  const onSubmitReset: SubmitHandler<ResetFormData> = async (data) => {
    if (!otpCode || otpCode.length < 6) {
      toast.error("Insira o código OTP de 6 dígitos.");
      return;
    }
    if (!confirmationResult) {
      toast.error("Sessão expirada. Volte e tente novamente.");
      setStep("PHONE");
      return;
    }
    try {
      setLoading(true);
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();

      await api.post("/auth/reset-password", {
        phone_number: phoneNumber,
        firebase_token: idToken,
        new_password: data.new_password,
      });

      toast.success("Palavra-passe alterada com sucesso!");
      router.push("/login");
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
      <div id="recaptcha-container" />

      {step === "PHONE" ? (
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={phoneForm.handleSubmit(onSubmitPhone)}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="p-2 rounded-xl"
                style={{
                  background: "rgba(133,204,132,0.15)",
                  color: "#3d9c3c",
                }}>
                <KeyRound size={18} />
              </span>
              <h1 className="font-bold text-2xl text-gray-900">
                Recuperar Senha
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Insira o seu número de telefone para receber um código por SMS.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Número de telefone
            </label>
            <input
              type="text"
              placeholder="+244923456789"
              style={inputStyle}
              {...phoneForm.register("phone_number", {
                required: "O número é obrigatório",
                pattern: {
                  value: /^\+244\d{9}$/,
                  message: "Formato: +244XXXXXXXXX",
                },
              })}
            />
            {phoneForm.formState.errors.phone_number && (
              <p className="text-xs text-red-500">
                {phoneForm.formState.errors.phone_number.message}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="btn-primary">
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              "Enviar código"
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors duration-200 cursor-pointer">
            <ArrowLeft size={14} />
            Voltar ao login
          </Link>
        </form>
      ) : (
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={resetForm.handleSubmit(onSubmitReset)}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={20} className="text-secondary" />
              <h1 className="font-bold text-2xl text-gray-900">
                Verificar Número
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Enviámos um código SMS para{" "}
              <span className="font-semibold text-gray-700">
                {phoneNumber}
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
                ...inputStyle,
                textAlign: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.5em",
                fontWeight: 700,
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Nova palavra-passe
            </label>
            <div className="relative">
              <input
                {...resetForm.register("new_password", {
                  required: "A nova palavra-passe é obrigatória",
                  minLength: { value: 6, message: "Mínimo 6 caracteres." },
                })}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: "44px" }}
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
            {resetForm.formState.errors.new_password && (
              <p className="text-xs text-red-500">
                {resetForm.formState.errors.new_password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Confirmar palavra-passe
            </label>
            <input
              {...resetForm.register("confirmPassword", {
                required: "A confirmação é obrigatória",
                validate: (v) =>
                  v === resetForm.watch("new_password") ||
                  "As palavras-passe não coincidem",
              })}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              style={inputStyle}
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={loading}
              type="submit"
              className="btn-primary">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                "Redefinir palavra-passe"
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep("PHONE")}
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

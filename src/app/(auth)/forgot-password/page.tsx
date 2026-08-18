/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { api } from "@/app/api/config";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";

interface RequestForm {
  phone_number: string;
}

interface ResetForm {
  otp: string;
  new_password: string;
  confirm_password: string;
}

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const router = useRouter();

  const requestForm = useForm<RequestForm>();
  const resetForm = useForm<ResetForm>();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        },
      );
    }
    return (window as any).recaptchaVerifier;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 9) {
      return `+244${cleaned}`;
    }

    if (cleaned.startsWith("244") && cleaned.length === 12) {
      return `+${cleaned}`;
    }

    return phone.startsWith("+") ? phone : `+${cleaned}`;
  };

  const handleSendOtp: SubmitHandler<RequestForm> = async (data) => {
    try {
      setLoading(true);
      const formattedPhone = data.phone_number.trim();

      await api.post("/auth/request-reset", {
        phone_number: formattedPhone,
      });

      const appVerifier = setupRecaptcha();

      const phoneE164 = formattedPhone.startsWith("+")
        ? formattedPhone
        : `+244${formattedPhone}`;

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneE164,
        appVerifier,
      );

      setConfirmationResult(confirmation);
      setPhoneNumber(formattedPhone);
      setStep("reset");
      toast.success("Código enviado por SMS!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao solicitar redefinição.";
      toast.error(msg);
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword: SubmitHandler<ResetForm> = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("As palavras-passes não coincidem");
      return;
    }

    if (!confirmationResult) {
      toast.error("Sessão de verificação expirada. Tente novamente.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await confirmationResult.confirm(data.otp);

      const firebaseToken = await userCredential.user.getIdToken();

      await api.post("/auth/reset-password", {
        phone_number: phoneNumber.trim(),
        firebase_token: firebaseToken,
        new_password: data.new_password,
      });

      toast.success("Palavra-passe alterada com sucesso!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || "Código inválido ou expirado.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md lg:p-8 px-8 py-4">
      <ToastContainer />
      <div id="recaptcha-container"></div>

      {step === "request" ? (
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={requestForm.handleSubmit(handleSendOtp)}>
          <h1 className="font-semibold text-3xl max-lg:text-2xl">
            Recuperar Senha
          </h1>
          <p className="text-sm text-gray-600">
            Insira o seu número de telefone associado à conta para receber um
            código de verificação.
          </p>

          <div className="flex flex-col gap-1 w-full">
            <label className="flex flex-col gap-2 w-full">
              Número de Telefone
              <input
                placeholder="Ex: 923456789"
                {...requestForm.register("phone_number", {
                  required: "O telefone é obrigatório",
                })}
                type="tel"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>
            {requestForm.formState.errors.phone_number && (
              <p className="text-red-500 text-sm">
                {requestForm.formState.errors.phone_number.message}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="btn-primary mt-2">
            {loading ? (
              <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
            ) : (
              "Enviar Código"
            )}
          </button>

          <Link
            href="/login"
            className="text-center text-primary mt-2 hover:underline">
            Voltar ao Login
          </Link>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={resetForm.handleSubmit(handleResetPassword)}>
          <h1 className="font-semibold text-3xl max-lg:text-2xl">
            Nova Palavra-passe
          </h1>
          <p className="text-sm text-gray-600">
            Digite o código enviado para <strong>{phoneNumber}</strong> e
            escolha a sua nova senha.
          </p>

          <div className="flex flex-col gap-1 w-full">
            <label className="flex flex-col gap-2 w-full">
              Código de Verificação (OTP)
              <input
                placeholder="Ex: 123456"
                {...resetForm.register("otp", {
                  required: "O código é obrigatório",
                })}
                type="text"
                className="w-full bg-white rounded-md px-4 py-2 outline-none text-center tracking-widest text-lg"
              />
            </label>
            {resetForm.formState.errors.otp && (
              <p className="text-red-500 text-sm">
                {resetForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="flex flex-col gap-2 w-full">
              Nova Palavra-passe
              <input
                placeholder="********"
                {...resetForm.register("new_password", {
                  required: "A nova palavra-passe é obrigatória",
                  minLength: { value: 6, message: "Mínimo de 6 caracteres" },
                })}
                type="password"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>
            {resetForm.formState.errors.new_password && (
              <p className="text-red-500 text-sm">
                {resetForm.formState.errors.new_password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="flex flex-col gap-2 w-full">
              Confirmar Palavra-passe
              <input
                placeholder="********"
                {...resetForm.register("confirm_password", {
                  required: "Confirme a palavra-passe",
                })}
                type="password"
                className="w-full bg-white rounded-md px-4 py-2 outline-none"
              />
            </label>
            {resetForm.formState.errors.confirm_password && (
              <p className="text-red-500 text-sm">
                {resetForm.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="btn-primary mt-2">
            {loading ? (
              <div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
            ) : (
              "Redefinir Palavra-passe"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

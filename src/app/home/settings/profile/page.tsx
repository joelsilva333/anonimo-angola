"use client";

import { motion } from "framer-motion";
import {
  User,
  Phone,
  Lock,
  Trash2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/app/hooks/user";
import { api } from "@/app/api/config";
import { auth } from "@/app/lib/firebase";
import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

export default function ProfileSettings() {
  const { user } = useUser();
  const [googleLinked, setGoogleLinked] = useState(!!user?.google_linked);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [phoneAdded, setPhoneAdded] = useState(!!user?.phone_number);
  const [phoneStep, setPhoneStep] = useState<"IDLE" | "OTP">("IDLE");
  const [otpCode, setOtpCode] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-settings",
        { size: "invisible", callback: () => {} },
      );
    }
  }, []);

  const handleSendPhoneOtp = async () => {
    if (!/^\+244\d{9}$/.test(phoneNumber.trim())) {
      toast.error("Formato inválido. Usa +244XXXXXXXXX.");
      return;
    }
    try {
      setPhoneLoading(true);
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber.trim(),
        window.recaptchaVerifier,
      );
      setConfirmationResult(confirmation);
      setPhoneStep("OTP");
      toast.info("Código de verificação enviado por SMS!");
    } catch {
      toast.error("Erro ao enviar SMS. Verifica o número ou tenta mais tarde.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleConfirmPhoneOtp = async () => {
    if (!otpCode || otpCode.length < 6 || !confirmationResult) {
      toast.error("Insere o código OTP de 6 dígitos.");
      return;
    }
    try {
      setPhoneLoading(true);
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();

      await api.post("/auth/add-phone", {
        phone_number: phoneNumber.trim(),
        firebase_token: idToken,
      });

      setPhoneAdded(true);
      setPhoneStep("IDLE");
      const stored = localStorage.getItem("user_data");
      if (stored) {
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            ...JSON.parse(stored),
            phone_number: phoneNumber.trim(),
          }),
        );
      }
      toast.success("Telefone de recuperação associado com sucesso!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Código incorreto ou expirado.",
      );
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setLinkingGoogle(true);
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();

      await api.post("/auth/google/link", { firebase_token: idToken });

      setGoogleLinked(true);
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "user_data",
            JSON.stringify({ ...parsed, google_linked: true }),
          );
        }
      }
      toast.success("Conta Google vinculada com sucesso!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao vincular conta Google.",
      );
    } finally {
      setLinkingGoogle(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/home/settings"
          className="">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold uppercase">Conta e Perfil</h1>
      </div>

      <div className="card flex flex-col gap-6">
        {/*  */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <User
              size={20}
              className="text-black/80"
            />{" "}
            Indentificador Anônimo (Público)
          </label>
          <input
            type="text"
            placeholder="Escolha um nome de usuário anônimo"
            className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div id="recaptcha-container-settings" />
          <label className="font-semibold flex items-center gap-2">
            <Phone
              size={20}
              className="text-black/80"
            />{" "}
            Telefone de Recuperação (Oculto)*
          </label>
          <p className="text-sm text-black/80">
            (*) Este número serve apenas para recuperares a conta. Jamais será
            exibido a outros utilizadores. Não é obrigatório, mas é a única
            forma de recuperares a conta se perderes o acesso ao Google também.
          </p>

          {phoneAdded ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium w-fit">
              <CheckCircle2 size={16} /> Telefone de recuperação configurado
            </div>
          ) : phoneStep === "IDLE" ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="+244923456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
              />
              <button
                onClick={handleSendPhoneOtp}
                disabled={phoneLoading}
                className="btn-secondary shrink-0 whitespace-nowrap">
                {phoneLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current/40 border-t-current animate-spin" />
                ) : (
                  "Enviar código"
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Código SMS (6 dígitos)"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
              />
              <button
                onClick={handleConfirmPhoneOtp}
                disabled={phoneLoading}
                className="btn-primary shrink-0 whitespace-nowrap">
                {phoneLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800/60 pt-4 flex flex-col gap-3">
          <h2 className="font-semibold flex items-center gap-2">
            <FcGoogle size={20} /> Login rápido com Google
          </h2>
          <p className="text-sm text-black/80">
            Vincula uma conta Google para entrares mais rápido no futuro. Nunca
            guardamos o teu email, nome ou foto do Google — apenas um código
            interno que reconhece a tua conta anónima, sem revelar quem és.
          </p>
          {googleLinked ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium w-fit">
              <CheckCircle2 size={16} /> Conta Google vinculada
            </div>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={linkingGoogle}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer w-full sm:w-auto self-start">
              {linkingGoogle ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-400/40 border-t-gray-600 animate-spin" />
              ) : (
                <>
                  <FcGoogle size={18} />
                  Vincular conta Google
                </>
              )}
            </button>
          )}
        </div>

        <div className="border-t border-gray-800/60 pt-4 flex flex-col gap-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Lock size={20} /> Alterar Palavra-passe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Palavra-passe atual"
              className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
            />
            <input
              type="password"
              placeholder="Nova palavra-passe"
              className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
            />
          </div>
        </div>

        <button className="btn-secondary w-full sm:w-auto self-start">
          Guardar Alterações
        </button>
      </div>

      <div className="card  rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Trash2 size={20} /> Eliminar Conta
          </h2>
          <p className="">
            Ao eliminar a tua conta, todos os teus desabafos e interações serão
            permanentemente apagados da base de dados.
          </p>
        </div>

        <button className="btn-warning w-full sm:w-auto self-start">
          Eliminar Conta Permanentemente
        </button>
      </div>
    </motion.div>
  );
}

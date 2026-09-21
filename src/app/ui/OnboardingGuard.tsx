"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/app/api/config";
import { useUser } from "@/app/hooks/user";

interface FormData {
  anon_name: string;
}

/**
 * Contas criadas via Google nascem com `onboarding_completed: false` e um
 * nome temporário (ex: "google_a1b2c3"). Este guard bloqueia o resto da
 * app com um modal (sem forma de fechar) até a pessoa escolher o seu nome
 * anónimo definitivo — validado por formato e por uma verificação de
 * anonimato feita por IA no backend.
 */
export default function OnboardingGuard() {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const needsOnboarding = !userLoading && user && user.onboarding_completed === false;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/complete-onboarding", {
        anon_name: data.anon_name,
      });
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      toast.success("Nome definido! Bem-vindo(a) à comunidade.");
      // Recarrega para todos os componentes (useUser, Header, etc.)
      // sincronizarem com o novo estado do utilizador.
      window.location.reload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Erro ao definir o nome. Tenta novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {needsOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
          }}>
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="max-w-sm w-full flex flex-col p-8"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: "28px",
              boxShadow: "0 24px 64px rgba(30,30,30,0.20)",
              fontFamily: "'Raleway', sans-serif",
            }}>
            <div
              className="p-3 rounded-2xl mb-3 w-fit"
              style={{ background: "rgba(133,204,132,0.15)", color: "#3d9c3c" }}>
              <Sparkles size={22} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Escolhe o teu nome anónimo
            </h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Entraste com o Google, mas na Anônimo Angola és sempre anónimo(a).
              Escolhe um pseudónimo — nunca o teu nome real — para continuar.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3">
              <input
                {...register("anon_name", {
                  required: "O nome é obrigatório",
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
                      (v.length >= 5 && v.length <= 24) || "Entre 5 e 24 caracteres",
                  },
                })}
                autoFocus
                placeholder="Ex: anonimo123"
                className="glass-input text-sm"
                style={{ borderRadius: "12px" }}
              />
              {errors.anon_name && (
                <p className="text-xs text-red-500">
                  {errors.anon_name.message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary">
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  "Confirmar nome"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

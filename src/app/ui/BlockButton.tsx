/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { api } from "@/app/api/config";

export default function BlockButton({
  userId,
  anonName,
  initialBlocked,
  onChange,
  requireAuth,
}: {
  userId: string;
  anonName: string;
  initialBlocked: boolean;
  onChange?: (blocked: boolean) => void;
  requireAuth: () => boolean;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/users/${userId}/block`);
      setBlocked(response.data.blocked);
      onChange?.(response.data.blocked);
      setConfirmOpen(false);
      toast.success(
        response.data.blocked
          ? `${anonName} foi bloqueado.`
          : `${anonName} foi desbloqueado.`,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao actualizar bloqueio.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!requireAuth()) return;
    if (blocked) {
      handleToggle();
    } else {
      setConfirmOpen(true);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={loading}
        title={blocked ? "Desbloquear" : "Bloquear"}
        className={`flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-200 ${
          blocked
            ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
            : "text-white"
        }`}
        style={
          blocked
            ? {}
            : { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.30)" }
        }>
        {blocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
      </motion.button>

      <AnimatePresence>
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="card max-w-sm w-full p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-gray-900">
                Bloquear {anonName}?
              </h3>
              <p className="text-sm text-gray-500">
                Deixarás de ver os desabafos desta pessoa e ela deixa de te
                conseguir seguir, comentar ou enviar-te mensagens. Podes
                desbloquear a qualquer momento nas definições de privacidade.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="btn-secondary">
                  Cancelar
                </button>
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className="btn-warning">
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    "Bloquear"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

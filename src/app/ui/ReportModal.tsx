"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { Flag } from "lucide-react";
import { api } from "@/app/api/config";
import { toast } from "react-toastify";

const REPORT_REASONS = [
  "Spam ou publicidade",
  "Conteúdo ofensivo ou discurso de ódio",
  "Assédio ou bullying",
  "Informação falsa",
  "Conteúdo sexual ou impróprio",
  "Outro",
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment" | "answer" | "message";
  targetId: string;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setDetails("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Selecione um motivo para a denúncia.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/reports/${targetType}/${targetId}`, {
        reason,
        details: details || undefined,
      });
      toast.success("Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.");
      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Erro ao enviar denúncia. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative max-w-sm w-full flex flex-col p-6"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.50)",
              borderRadius: "28px",
              boxShadow: "0 24px 64px rgba(30,30,30,0.18)",
              fontFamily: "'Raleway', sans-serif",
            }}>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors duration-200 cursor-pointer hover:bg-black/5">
              <FaTimes />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-red-50 text-red-500">
                <Flag size={16} />
              </span>
              <h3 className="text-lg font-bold text-gray-900">Denunciar</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Ajuda-nos a perceber o que está errado. A tua denúncia é anónima.
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors duration-200 ${
                    reason === option
                      ? "bg-secondary/15 text-secondary font-semibold"
                      : "hover:bg-black/5 text-gray-700"
                  }`}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={option}
                    checked={reason === option}
                    onChange={() => setReason(option)}
                    className="accent-secondary"
                  />
                  {option}
                </label>
              ))}
            </div>

            {reason === "Outro" && (
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Descreve o problema..."
                rows={3}
                className="glass-input text-sm resize-none mb-4"
                style={{ borderRadius: "12px" }}
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl transition-all duration-200 cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2"
                style={{ background: "#e05d5d" }}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                ) : (
                  "Denunciar"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

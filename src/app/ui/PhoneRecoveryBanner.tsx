"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { useUser } from "@/app/hooks/user";

/**
 * Lembrete persistente (nunca bloqueia o uso da app) para quem ainda não
 * tem telefone de recuperação associado. Pode ser fechado, mas volta a
 * aparecer na sessão seguinte — a única forma de o remover de vez é
 * mesmo configurar o telefone.
 */
export default function PhoneRecoveryBanner() {
  const { user, loading } = useUser();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow =
    !loading &&
    !!user &&
    user.onboarding_completed !== false &&
    !user.phone_number;

  return (
    <AnimatePresence>
      {shouldShow && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="w-full flex items-center gap-3 p-4"
          style={{
            background: "rgba(255,244,235,0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(240,170,110,0.35)",
            borderRadius: "20px",
            fontFamily: "'Raleway', sans-serif",
          }}>
          <span
            className="p-2 rounded-xl shrink-0"
            style={{ background: "rgba(240,170,110,0.18)", color: "#c9711f" }}>
            <ShieldAlert size={16} />
          </span>
          <p className="flex-1 text-sm text-gray-700 leading-relaxed">
            Configura um{" "}
            <Link
              href="/home/settings/profile"
              className="font-semibold text-secondary hover:underline">
              telefone de recuperação
            </Link>{" "}
            — é a única forma de recuperares a conta se um dia perderes o
            acesso ao Google também.
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-full cursor-pointer hover:bg-black/5 transition-colors shrink-0"
            aria-label="Fechar">
            <X size={14} className="text-gray-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

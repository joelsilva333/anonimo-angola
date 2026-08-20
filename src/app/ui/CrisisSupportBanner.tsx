"use client";

import { HeartHandshake, PhoneCall, MessageCircleHeart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Banner acolhedor mostrado sempre que a IA (Gemini) detecta sinais sérios de
 * crise emocional/ideação suicida num desabafo. Nunca bloqueia a publicação —
 * apenas oferece, de forma calorosa, contactos de apoio em Angola.
 */
export default function CrisisSupportBanner({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col gap-3 p-5 relative"
          style={{
            background: "rgba(255, 244, 235, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(240, 170, 110, 0.35)",
            borderRadius: "24px",
            boxShadow: "0 4px 24px rgba(30,30,30,0.06)",
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
            aria-label="Fechar"
          >
            <X size={16} className="text-gray-500" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <span
              className="p-2.5 rounded-2xl shrink-0"
              style={{ background: "rgba(240, 170, 110, 0.18)", color: "#c9711f" }}
            >
              <HeartHandshake size={20} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">
                Sentimos que este desabafo carrega uma dor muito grande
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Não precisas de passar por isto sozinho(a). A tua publicação foi partilhada
                normalmente com a comunidade — e continuamos aqui para te ouvir.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pl-1">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <PhoneCall size={15} className="text-[#c9711f] shrink-0" />
              <span>
                Em caso de perigo imediato, contacta já o <strong>INEMA</strong> (Instituto
                Nacional de Emergências Médicas de Angola) através do número{" "}
                <strong>111</strong>, ou dirige-te à urgência mais próxima.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MessageCircleHeart size={15} className="text-[#c9711f] shrink-0" />
              <span>
                Também podes falar agora com alguém de confiança, ou com o nosso assistente de
                apoio emocional.
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap pl-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/home/support")}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-colors"
              style={{ background: "#85cc84" }}
            >
              Falar com o Apoio Emocional
            </motion.button>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
            >
              Estou bem, obrigado(a)
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import { BookHeart, Sparkles, Lightbulb, Lock } from "lucide-react";
import TimeAgo from "react-timeago";
import { customFormatter } from "@/app/utils/customFormatter";
import useMoodTracker from "@/app/hooks/use-mood-tracker";

const MOOD_COLORS: Record<string, string> = {
  Ansioso: "#e0985c",
  Triste: "#6b8fce",
  Esperançoso: "#85cc84",
  Grato: "#c9a24b",
  Frustrado: "#d16a6a",
  Sobrecarregado: "#a06bd1",
  Calmo: "#5cbcae",
  Confuso: "#9a9a9a",
  Empático: "#4ea1d3",
  Solitário: "#7a7ac9",
  Neutro: "#9ca3af",
};

function moodColor(mood: string): string {
  return MOOD_COLORS[mood] || "#85cc84";
}

const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.38)",
  borderRadius: "24px",
  boxShadow: "0 4px 24px rgba(30,30,30,0.06), 0 1px 4px rgba(30,30,30,0.04)",
};

export default function MoodTrackerPage() {
  const { data, loading, error } = useMoodTracker();

  return (
    <div
      className="w-full flex flex-col gap-5 py-6"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      {/* ── Cabeçalho ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full p-6 flex flex-col gap-2"
        style={glassCard}
      >
        <span className="flex items-center gap-3">
          <span
            className="p-2.5 rounded-2xl"
            style={{ background: "rgba(133,204,132,0.15)", color: "#3d9c3c" }}
          >
            <BookHeart size={22} />
          </span>
          <h1 className="text-2xl max-lg:text-xl font-bold text-gray-900">
            Diário Emocional
          </h1>
        </span>
        <p className="text-sm text-gray-500 leading-relaxed">
          Uma visão privada da tua evolução emocional, gerada pela IA a partir dos teus próprios
          desabafos. Só tu podes ver esta página.
        </p>
        <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
          <Lock size={11} />
          Nunca partilhamos o texto dos teus desabafos com ninguém — apenas a tendência de humor.
        </span>
      </motion.div>

      {loading && (
        <div className="w-full flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 animate-pulse">
            A analisar o teu diário emocional...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="w-full p-6 text-center text-sm text-gray-500" style={glassCard}>
          {error}
        </div>
      )}

      {!loading && !error && data && data.timeline.length === 0 && (
        <div className="w-full p-8 flex flex-col items-center text-center gap-2" style={glassCard}>
          <Sparkles size={22} style={{ color: "#85cc84" }} />
          <p className="text-sm text-gray-500 max-w-xs">
            Ainda não temos desabafos suficientes para traçar a tua evolução emocional. Partilha
            um desabafo para começares o teu diário.
          </p>
        </div>
      )}

      {!loading && !error && data && data.timeline.length > 0 && (
        <>
          {/* ── Resumo da IA ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="w-full p-6 flex flex-col gap-3"
            style={glassCard}
          >
            <span className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400">
              <Sparkles size={13} style={{ color: "#85cc84" }} />
              Tendência recente
            </span>
            <p className="text-base text-gray-800 leading-relaxed">{data.summary}</p>
          </motion.div>

          {/* ── Distribuição de humores ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="w-full p-6 flex flex-col gap-4"
            style={glassCard}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
              Humores mais frequentes
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.moodCounts)
                .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
                .map(([mood, count]) => (
                  <span
                    key={mood}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: `${moodColor(mood)}1f`,
                      color: moodColor(mood),
                      border: `1px solid ${moodColor(mood)}55`,
                    }}
                  >
                    {mood}
                    <span className="text-xs opacity-70">×{count}</span>
                  </span>
                ))}
            </div>
          </motion.div>

          {/* ── Linha do tempo ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="w-full p-6 flex flex-col gap-4"
            style={glassCard}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
              Evolução recente
            </span>
            <div className="flex flex-col gap-2">
              {data.timeline
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div key={`${entry.date}-${index}`} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: moodColor(entry.mood) }}
                    />
                    <span className="text-sm text-gray-700 font-medium flex-1">
                      {entry.mood}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      <TimeAgo date={entry.date} formatter={customFormatter} />
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* ── Sugestões de autocuidado ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="w-full p-6 flex flex-col gap-3"
            style={glassCard}
          >
            <span className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400">
              <Lightbulb size={13} style={{ color: "#85cc84" }} />
              Sugestões leves de autocuidado
            </span>
            <ul className="flex flex-col gap-2">
              {data.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: "#85cc84" }}
                  />
                  {suggestion}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-1">
              Estas sugestões são geradas por IA e não substituem acompanhamento profissional de
              saúde mental.
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Send, ShieldAlert, RotateCcw } from "lucide-react";
import { useSupportChat } from "@/app/hooks/use-support-chat";

export default function SupportPage() {
  const { messages, sendMessage, sending, loading, error, reset } =
    useSupportChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input;
    setInput("");
    sendMessage(text);
  };

  return (
    <div className="w-full flex flex-col gap-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-3xl p-6 flex flex-col gap-2 border border-gray-100">
        <span className="flex items-center gap-3">
          <span className="bg-secondary/10 text-secondary p-2.5 rounded-2xl">
            <HeartHandshake size={22} />
          </span>
          <h1 className="text-2xl font-bold">Apoio Emocional</h1>
        </span>
        <p className="text-sm text-gray-500 leading-relaxed">
          Este é um espaço anónimo para desabafares com uma IA que ouve sem
          julgar. Não é um profissional de saúde e não substitui terapia ou
          aconselhamento médico.
        </p>
      </motion.div>

      <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-start gap-3 text-sm">
        <ShieldAlert
          size={18}
          className="shrink-0 mt-0.5"
        />
        <p>
          Se estás em perigo imediato, liga já para o{" "}
          <strong>INEMA — 111</strong>, ou dirige-te à urgência mais próxima.
          Fala também com alguém de confiança sempre que puderes.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="w-full bg-white rounded-3xl border border-gray-100 flex flex-col gap-4 p-6 min-h-[50vh] max-h-[60vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center m-auto gap-1">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center m-auto max-w-xs">
            Escreve à vontade. Podes começar por contar como tem sido o teu dia,
            ou o que está a pesar-te.
          </p>
        )}

        {!loading &&
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "self-end bg-primary text-white rounded-br-md"
                  : "self-start bg-gray-100 text-gray-800 rounded-bl-md"
              }`}>
              {message.content || (
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              )}
            </div>
          ))}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center gap-2 bg-white rounded-2xl border border-gray-200 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending || loading}
          placeholder="Escreve a tua mensagem..."
          className="flex-1 px-3 py-2 outline-none bg-transparent text-sm"
        />

        <button
          type="button"
          onClick={reset}
          disabled={messages.length === 0 || sending || loading}
          title="Recomeçar conversa"
          className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-300 disabled:opacity-30 cursor-pointer">
          <RotateCcw size={18} />
        </button>

        <button
          type="submit"
          disabled={sending || loading || !input.trim()}
          className="p-2.5 rounded-xl bg-secondary text-white hover:bg-secondary-hover transition-colors duration-300 disabled:opacity-40 cursor-pointer">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

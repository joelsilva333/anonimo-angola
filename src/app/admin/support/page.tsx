"use client";

import { useState } from "react";
import { AlertTriangle, MessageCircle, X } from "lucide-react";
import {
  useAdminSupportConversations,
  useAdminSupportConversation,
} from "@/app/hooks/admin";

const PAGE_SIZE = 20;

export default function AdminSupportPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading } = useAdminSupportConversations({ page, pageSize: PAGE_SIZE });
  const { conversation, loading: conversationLoading } = useAdminSupportConversation(selectedId);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <p className="text-xs text-gray-500">
        Conversas anónimas entre utilizadores e o &quot;Ouvinte&quot; (IA de apoio emocional). As
        marcadas com um alerta tiveram uma mensagem com sinais de crise (ideação suicida,
        auto-agressão, etc.) — a IA já respondeu com informação de emergência (INEMA — 111),
        mas pode valer a pena reveres o contexto.
      </p>

      {loading ? (
        <div className="card flex justify-center py-16">
          <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="card text-sm text-center text-gray-400 py-16">
          Ainda não há conversas de apoio registadas.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`card p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-all duration-200 hover:shadow-md ${
                conv.hasCrisis ? "border-l-4 border-l-red-400" : ""
              }`}>
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: conv.hasCrisis ? "rgba(239,68,68,0.12)" : "rgba(133,204,132,0.14)",
                    color: conv.hasCrisis ? "#ef4444" : "#5aa858",
                  }}>
                  {conv.hasCrisis ? <AlertTriangle size={17} /> : <MessageCircle size={17} />}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{conv.anon_name}</p>
                  <p className="text-xs text-gray-400">
                    {conv.status === "active" ? "Activa" : "Encerrada"} · actualizada em{" "}
                    {new Date(conv.updatedAt).toLocaleString("pt-PT")}
                  </p>
                </div>
              </div>
              {conv.hasCrisis && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">
                  Crise
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary w-auto px-4 py-1.5 text-xs disabled:opacity-40">
            Anterior
          </button>
          <span className="text-xs text-gray-400">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary w-auto px-4 py-1.5 text-xs disabled:opacity-40">
            Seguinte
          </button>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="card max-w-lg w-full p-6 flex flex-col gap-4 max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Conversa de {conversation?.anon_name || "..."}
              </h3>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors duration-200 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
              {conversationLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                conversation?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === "user"
                        ? "self-end bg-primary text-white rounded-br-md"
                        : "self-start bg-gray-100 text-gray-800 rounded-bl-md"
                    } ${message.isCrisis ? "ring-2 ring-red-400" : ""}`}>
                    {message.content}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

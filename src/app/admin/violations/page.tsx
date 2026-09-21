"use client";

import { useState } from "react";
import { useAdminViolations } from "@/app/hooks/admin";

const PAGE_SIZE = 25;

const CATEGORY_LABEL: Record<string, string> = {
  seguro: "Seguro",
  odio: "Ódio",
  doxxing: "Doxxing",
  spam: "Spam",
  assedio_sexual: "Assédio sexual",
};

export default function AdminViolationsPage() {
  const [page, setPage] = useState(1);
  const { data, loading } = useAdminViolations({ page, pageSize: PAGE_SIZE });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <p className="text-xs text-gray-500">
        Cada conteúdo bloqueado pela IA de moderação (posts, comentários, respostas, mensagens)
        fica aqui registado. 3 violações em 7 dias suspendem a conta automaticamente.
      </p>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-center text-gray-400 py-16">Sem violações registadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-black/5">
                  <th className="px-5 py-3 font-semibold">Utilizador</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Motivo</th>
                  <th className="px-5 py-3 font-semibold text-right">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((v) => (
                  <tr key={v.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                    <td className="px-5 py-3 font-medium text-gray-800">{v.anon_name}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{v.contentType}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        {CATEGORY_LABEL[v.category] || v.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate" title={v.reason || ""}>
                      {v.reason || "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400 whitespace-nowrap">
                      {new Date(v.created_at).toLocaleString("pt-PT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}

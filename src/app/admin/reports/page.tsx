/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Check, X, Trash2 } from "lucide-react";
import { useAdminReports } from "@/app/hooks/admin";
import { api } from "@/app/api/config";
import { AdminReport, AdminReportStatus } from "@/app/interfaces/admin";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<AdminReportStatus, string> = {
  pending: "Pendentes",
  resolved: "Resolvidas",
  dismissed: "Dispensadas",
};

export default function AdminReportsPage() {
  const [status, setStatus] = useState<AdminReportStatus>("pending");
  const [page, setPage] = useState(1);
  const [actingId, setActingId] = useState<string | null>(null);
  const [deleteWithResolve, setDeleteWithResolve] = useState<Record<string, boolean>>({});

  const { data, loading, refetch } = useAdminReports({ status, page, pageSize: PAGE_SIZE });

  const handleResolve = async (report: AdminReport, action: "resolved" | "dismissed") => {
    setActingId(report.id);
    try {
      await api.patch(`/admin/reports/${report.id}`, {
        action,
        deleteContent: action === "resolved" ? !!deleteWithResolve[report.id] : false,
      });
      toast.success(
        action === "resolved" ? "Denúncia marcada como resolvida." : "Denúncia dispensada.",
      );
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao actualizar denúncia.");
    } finally {
      setActingId(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <div className="flex gap-2">
        {(Object.keys(STATUS_LABEL) as AdminReportStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setPage(1);
              setStatus(s);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              status === s ? "bg-secondary text-white" : "bg-white/70 text-gray-500 hover:bg-white"
            }`}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-center text-gray-400 py-16 card">
          Nenhuma denúncia {STATUS_LABEL[status].toLowerCase()}.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((report) => (
            <div key={report.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    {report.target_type} denunciado por {report.reporter.anon_name || "utilizador removido"}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{report.reason}</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(report.created_at).toLocaleString("pt-PT")}
                </span>
              </div>

              {report.details && (
                <p className="text-xs text-gray-500 italic">&ldquo;{report.details}&rdquo;</p>
              )}

              <div
                className="p-3 rounded-xl text-sm text-gray-700"
                style={{ background: "rgba(0,0,0,0.03)" }}>
                {report.target ? (
                  <>
                    <span className="block text-xs text-gray-400 mb-1">
                      Autor: {report.target.authorAnonName || "desconhecido"}
                    </span>
                    {report.target.text}
                  </>
                ) : (
                  <span className="text-gray-400 italic">
                    Conteúdo já não existe (pode já ter sido apagado).
                  </span>
                )}
              </div>

              {status === "pending" && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!deleteWithResolve[report.id]}
                      onChange={(e) =>
                        setDeleteWithResolve((prev) => ({ ...prev, [report.id]: e.target.checked }))
                      }
                      disabled={!report.target}
                    />
                    <Trash2 size={13} />
                    Apagar conteúdo ao resolver
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(report, "dismissed")}
                      disabled={actingId === report.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-black/5 transition-all duration-200 cursor-pointer disabled:opacity-40">
                      <X size={13} />
                      Dispensar
                    </button>
                    <button
                      onClick={() => handleResolve(report, "resolved")}
                      disabled={actingId === report.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-40"
                      style={{ background: "#85cc84" }}>
                      <Check size={13} />
                      Resolver
                    </button>
                  </div>
                </div>
              )}

              {status !== "pending" && (
                <span className="text-xs text-gray-400">
                  {status === "resolved" ? "Resolvida" : "Dispensada"} em{" "}
                  {report.resolved_at ? new Date(report.resolved_at).toLocaleString("pt-PT") : "—"}
                </span>
              )}
            </div>
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
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Search, ShieldAlert, ShieldCheck, History } from "lucide-react";
import { useAdminUsers, useAdminUserViolations } from "@/app/hooks/admin";
import { api } from "@/app/api/config";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";
import { AdminUser } from "@/app/interfaces/admin";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [page, setPage] = useState(1);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [violationsTarget, setViolationsTarget] = useState<AdminUser | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const { data, loading, refetch } = useAdminUsers({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    pageSize: PAGE_SIZE,
  });

  const { violations, loading: violationsLoading } = useAdminUserViolations(
    violationsTarget?.id || null,
  );

  const handleUnban = async (user: AdminUser) => {
    setActingId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/unban`);
      toast.success(`${user.anon_name} foi reactivado.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao reactivar conta.");
    } finally {
      setActingId(null);
    }
  };

  const handleBan = async () => {
    if (!banTarget) return;
    setActingId(banTarget.id);
    try {
      await api.post(`/admin/users/${banTarget.id}/ban`, { reason: banReason });
      toast.success(`${banTarget.anon_name} foi suspenso.`);
      setBanTarget(null);
      setBanReason("");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao suspender conta.");
    } finally {
      setActingId(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Pesquisar por nome anónimo..."
            className="glass-input pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "suspended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setPage(1);
                setStatus(s);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                status === s ? "bg-secondary text-white" : "bg-white/70 text-gray-500 hover:bg-white"
              }`}>
              {s === "all" ? "Todos" : s === "active" ? "Activos" : "Suspensos"}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-center text-gray-400 py-16">Nenhum utilizador encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-black/5">
                  <th className="px-5 py-3 font-semibold">Utilizador</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Criado em</th>
                  <th className="px-5 py-3 font-semibold text-right">Acções</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <tr key={user.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        {user.profile_picture && (
                          <Image
                            src={getProfilePictureUrl(user.profile_picture)}
                            width={30}
                            height={30}
                            unoptimized
                            alt={user.anon_name}
                            className="rounded-full object-cover w-[30px] h-[30px]"
                          />
                        )}
                        <span className="font-medium text-gray-800">{user.anon_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.is_active ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                          Activo
                        </span>
                      ) : (
                        <span
                          title={user.banned_reason || ""}
                          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 cursor-help">
                          Suspenso
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViolationsTarget(user)}
                          title="Ver violações"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors duration-200 cursor-pointer">
                          <History size={15} />
                        </button>
                        {user.role !== "admin" &&
                          (user.is_active ? (
                            <button
                              onClick={() => setBanTarget(user)}
                              disabled={actingId === user.id}
                              title="Suspender"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer disabled:opacity-40">
                              <ShieldAlert size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnban(user)}
                              disabled={actingId === user.id}
                              title="Reactivar"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-colors duration-200 cursor-pointer disabled:opacity-40">
                              <ShieldCheck size={15} />
                            </button>
                          ))}
                      </div>
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

      {/* Modal: suspender */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="card max-w-sm w-full p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-900">
              Suspender {banTarget.anon_name}?
            </h3>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Motivo da suspensão (opcional)"
              className="glass-input text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBanTarget(null);
                  setBanReason("");
                }}
                className="btn-secondary">
                Cancelar
              </button>
              <button onClick={handleBan} disabled={actingId === banTarget.id} className="btn-warning">
                Suspender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: violações */}
      {violationsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="card max-w-md w-full p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Violações de {violationsTarget.anon_name}
              </h3>
              <button
                onClick={() => setViolationsTarget(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer text-sm">
                Fechar
              </button>
            </div>
            {violationsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : violations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Sem violações registadas.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {violations.map((v) => (
                  <li key={v.id} className="p-3 rounded-xl bg-black/[0.03] text-xs flex flex-col gap-1">
                    <div className="flex justify-between text-gray-400">
                      <span className="font-semibold text-gray-600 uppercase">
                        {v.contentType} · {v.category}
                      </span>
                      <span>{new Date(v.created_at).toLocaleString("pt-PT")}</span>
                    </div>
                    {v.reason && <p className="text-gray-600">{v.reason}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

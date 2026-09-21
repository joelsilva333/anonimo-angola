"use client";

import { useAdminStats } from "@/app/hooks/admin";
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  Flag as FlagIcon,
  AlertTriangle,
  ShieldAlert,
  HeartCrack,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  tone?: "default" | "danger" | "warning";
}) {
  const toneStyles = {
    default: { bg: "rgba(133,204,132,0.14)", color: "#5aa858" },
    danger: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    warning: { bg: "rgba(240,170,110,0.15)", color: "#c9711f" },
  }[tone];

  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: toneStyles.bg, color: toneStyles.color }}>
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { stats, loading, error } = useAdminStats();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <p className="text-sm text-center text-gray-400 py-24">
        Não foi possível carregar as estatísticas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          Utilizadores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total de utilizadores" value={stats.users.total} />
          <StatCard icon={UserCheck} label="Contas activas" value={stats.users.active} />
          <StatCard
            icon={UserX}
            label="Contas suspensas"
            value={stats.users.suspended}
            tone={stats.users.suspended > 0 ? "danger" : "default"}
          />
          <StatCard icon={Users} label="Novos (7 dias)" value={stats.users.newLast7Days} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          Desabafos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total de desabafos" value={stats.posts.total} />
          <StatCard
            icon={AlertTriangle}
            label="Marcados (flagged)"
            value={stats.posts.flagged}
            tone={stats.posts.flagged > 0 ? "warning" : "default"}
          />
          <StatCard
            icon={HeartCrack}
            label="Crise emocional detectada"
            value={stats.posts.crisisDetected}
            tone={stats.posts.crisisDetected > 0 ? "warning" : "default"}
          />
          <StatCard icon={FileText} label="Novos (7 dias)" value={stats.posts.newLast7Days} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          Moderação
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FlagIcon}
            label="Denúncias pendentes"
            value={stats.reports.pending}
            tone={stats.reports.pending > 0 ? "danger" : "default"}
          />
          <StatCard icon={FlagIcon} label="Denúncias resolvidas" value={stats.reports.resolved} />
          <StatCard icon={FlagIcon} label="Denúncias dispensadas" value={stats.reports.dismissed} />
          <StatCard
            icon={ShieldAlert}
            label="Violações de IA (total)"
            value={stats.violations.total}
          />
        </div>
      </section>
    </div>
  );
}

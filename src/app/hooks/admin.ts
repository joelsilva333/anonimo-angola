import { useCallback, useEffect, useState } from "react";
import { api } from "../api/config";
import {
  AdminStats,
  AdminUser,
  AdminReport,
  AdminReportStatus,
  AdminViolation,
  PaginatedResult,
} from "../interfaces/admin";

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/stats");
      setStats(response.data);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminUsers(filters: {
  search?: string;
  status?: "active" | "suspended";
  page: number;
  pageSize: number;
}) {
  const [data, setData] = useState<PaginatedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users", { params: filters });
      setData(response.data);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar utilizadores:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.page, filters.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
}

export function useAdminReports(filters: {
  status?: AdminReportStatus;
  page: number;
  pageSize: number;
}) {
  const [data, setData] = useState<PaginatedResult<AdminReport> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/reports", { params: filters });
      setData(response.data);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar denúncias:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.page, filters.pageSize]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
}

export function useAdminViolations(filters: { page: number; pageSize: number }) {
  const [data, setData] = useState<PaginatedResult<AdminViolation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/violations", { params: filters });
      setData(response.data);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar violações:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.pageSize]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return { data, loading, error, refetch: fetchViolations };
}

export function useAdminUserViolations(userId: string | null) {
  const [violations, setViolations] = useState<AdminViolation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchViolations = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}/violations`);
      setViolations(response.data);
    } catch (err) {
      console.error("Erro ao buscar violações do utilizador:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return { violations, loading, refetch: fetchViolations };
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/user";

/**
 * Gate visual/UX apenas — a segurança real está no backend
 * (`adminMiddleware`, que valida `role === "admin"` a partir do JWT em
 * cada pedido). Isto só evita que alguém sem a role veja sequer o layout
 * do painel antes de qualquer pedido falhar.
 */
export default function AdminGuard() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/home");
    }
  }, [loading, user, router]);

  return null;
}

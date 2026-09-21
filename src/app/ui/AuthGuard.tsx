"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";
import { useUser } from "@/app/hooks/user";

/**
 * O middleware (src/middleware.ts) já bloqueia o acesso a /home sem o
 * cookie `aa_token`. Mas o resto da app lê o utilizador do localStorage
 * (`user_data`), que pode ficar dessincronizado do cookie (ex.: dados
 * limpos manualmente, outra aba, falha ao guardar no login). Nesse caso
 * o cookie deixa passar o middleware, mas a app fica num estado
 * inconsistente: header "deslogado" a mostrar conteúdo autenticado.
 *
 * Este guard fecha essa lacuna: assim que soubermos que não há
 * `user_data`, limpamos qualquer cookie órfão e mandamos para o login,
 * em vez de deixar a página renderizar num estado misto.
 */
export default function AuthGuard() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;

    const cookies = new Cookies();
    cookies.remove("aa_token", { path: "/" });
    router.replace("/login");
  }, [loading, user, router]);

  return null;
}

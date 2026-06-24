"use client";

import { motion } from "framer-motion";
import { User, Phone, Lock, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/hooks/user";

export default function ProfileSettings() {
  const { user } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/home/settings"
          className="">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold uppercase">Conta e Perfil</h1>
      </div>

      <div className="card flex flex-col gap-6">
        {/*  */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <User
              size={20}
              className="text-black/80"
            />{" "}
            Indentificador Anônimo (Público)
          </label>
          <input
            type="text"
            placeholder="Escolha um nome de usuário anônimo"
            className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <Phone
              size={20}
              className="text-black/80"
            />{" "}
            Telefone (Recuperação - Oculto)*
          </label>
          <input
            type="text"
            placeholder="Número de telefone para recuperação de conta"
            value={user?.phone_number || ""}
            className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
          />
          <p className="text-sm text-black/80">
           (*) Este número serve apenas para segurança da conta. Jamais será
            exibido a outros usuários.
          </p>
        </div>

        <div className="border-t border-gray-800/60 pt-4 flex flex-col gap-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Lock size={20} /> Alterar Palavra-passe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Palavra-passe atual"
              className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
            />
            <input
              type="password"
              placeholder="Nova palavra-passe"
              className="w-full bg-gray-100 rounded-2xl px-4 py-2 outline-none"
            />
          </div>
        </div>

        <button className="btn-secondary w-full sm:w-auto self-start">
          Guardar Alterações
        </button>
      </div>

      <div className="card  rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Trash2 size={20} /> Eliminar Conta
          </h2>
          <p className="">
            Ao eliminar a tua conta, todos os teus desabafos e interações serão
            permanentemente apagados da base de dados.
          </p>
        </div>

        <button className="btn-warning w-full sm:w-auto self-start">
          Eliminar Conta Permanentemente
        </button>
      </div>
    </motion.div>
  );
}

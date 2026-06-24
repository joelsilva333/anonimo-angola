"use client";

import { motion } from "framer-motion";
import { EyeOff, MessageSquare, UserX, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacySettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6"
    >
      {/* Cabeçalho da Página */}
      <div className="flex items-center gap-3">
        <Link href="/home/settings">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold uppercase">Privacidade e Segurança</h1>
      </div>

      {/* Card Principal: Configurações de Privacidade */}
      <div className="card flex flex-col gap-6">
        
        {/* Opção: Modo Anônimo Permanente */}
        <div className="flex flex-col gap-3">
          <label className="font-semibold flex items-center gap-2">
            <EyeOff size={20} className="text-black/80" />
            Modo Anônimo Permanente
          </label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-black/80 max-w-[80%]">
              Forçar que todas as tuas publicações e respostas futuras utilizem avatares e pseudónimos gerados automaticamente pela plataforma.
            </p>
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Opção: Controle de Comentários */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <MessageSquare size={20} className="text-black/80" />
            Controle de Comentários nos teus Posts
          </label>
          <select className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 outline-none cursor-pointer text-sm">
            <option value="todos">Permitir que qualquer utilizador comente</option>
            <option value="apenas-autenticados">Apenas utilizadores com conta criada</option>
            <option value="ninguem">Desativar comentários globalmente nos meus posts</option>
          </select>
        </div>

        {/* Opção: Quem pode enviar Mensagens Privadas */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <MessageCircle size={20} className="text-black/80" />
            Mensagens Privadas (Chats)
          </label>
          <select className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 outline-none cursor-pointer text-sm">
            <option value="todos">Qualquer pessoa pode iniciar um chat anônimo comigo</option>
            <option value="comentadores">Apenas pessoas com quem interagi em posts</option>
            <option value="ninguem">Bloquear novas solicitações de mensagens privadas</option>
          </select>
        </div>

        <button className="btn-secondary w-full sm:w-auto self-start">
          Guardar Definições de Privacidade
        </button>
      </div>

      {/* Card Secundário: Utilizadores Bloqueados */}
      <div className="card rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <UserX size={20} /> Utilizadores Bloqueados
          </h2>
          <p className="text-sm text-black/80">
            Gerir as identidades anónimas que bloqueaste. Utilizadores bloqueados não conseguem ver os teus desabafos no feed nem enviar-te mensagens.
          </p>
        </div>
        
        {/* Exemplo de Placeholder de lista vazia para manter a UI limpa */}
        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-sm text-zinc-500">
          Nenhum utilizador bloqueado de momento.
        </div>
      </div>
    </motion.div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Bell, MessageSquare, Heart, AtSign, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotificationsSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-5 flex flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <Link href="/home/settings">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold uppercase">Notificações</h1>
      </div>

      {/* Card Único de Alertas */}
      <div className="card flex flex-col gap-6">
        <div className="flex flex-col">
          <h2 className="font-semibold text-base flex items-center gap-2 mb-1">
            <Bell size={20} /> Alertas de Atividade
          </h2>
          <p className="text-sm text-black/80">
            Escolha quais as ações no Anônimo Angola que devem fazer disparar alertas em tempo real.
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
          
          {/* Notificação de Novos Comentários */}
          <div className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-secondary" />
              <div>
                <p className="font-medium text-sm">Novos Comentários</p>
                <p className="text-xs text-zinc-500">Quando alguém comentar num desabafo teu.</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary rounded cursor-pointer" />
          </div>

          {/* Notificação de Reações (Apoios) */}
          <div className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Heart size={18} className="text-secondary" />
              <div>
                <p className="font-medium text-sm">Reações e Apoios</p>
                <p className="text-xs text-zinc-500">Quando o teu post receber um &quot;Apoiar&quot;.</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary rounded cursor-pointer" />
          </div>

          {/* Alertas de Menções */}
          <div className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <AtSign size={18} className="text-secondary" />
              <div>
                <p className="font-medium text-sm">Alertas de Menções</p>
                <p className="text-xs text-zinc-500">Se alguém citar o teu identificador anônimo num comentário.</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary rounded cursor-pointer" />
          </div>

          {/* Novas Mensagens Privadas */}
          <div className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-secondary" />
              <div>
                <p className="font-medium text-sm">Novas Mensagens Privadas</p>
                <p className="text-xs text-zinc-500">Quando receberes mensagens em chats anônimos ativos.</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary rounded cursor-pointer" />
          </div>

        </div>

        <button className="btn-secondary w-full sm:w-auto self-start mt-2">
          Guardar Preferências
        </button>
      </div>
    </motion.div>
  );
}
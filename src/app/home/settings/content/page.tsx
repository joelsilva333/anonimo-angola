"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sliders, AlertTriangle, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContentSettings() {
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
        <h1 className="text-lg font-bold uppercase">Conteúdo e Moderação</h1>
      </div>

      {/* Card Principal: Filtros de Visualização */}
      <div className="card flex flex-col gap-6">
        
        {/* Filtro de Linguagem Ofensiva */}
        <div className="flex flex-col gap-3">
          <label className="font-semibold flex items-center gap-2">
            <ShieldCheck size={20} className="text-black/80" />
            Filtro de Linguagem Ofensiva
          </label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-black/80 max-w-[80%]">
              Ocultar automaticamente insultos graves ou palavras impróprias no feed com caracteres especiais (ex: ****).
            </p>
            <input 
              type="checkbox" 
              defaultChecked
              className="w-5 h-5 accent-secondary rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Filtro de Tópicos Sensíveis */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <AlertTriangle size={20} className="text-black/80" />
            Filtro de Tópicos Sensíveis
          </label>
          <select className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 outline-none cursor-pointer text-sm">
            <option value="desfocar">Desfocar posts sensíveis (Exibir aviso antes de ler)</option>
            <option value="ocultar">Ocultar completamente do meu feed</option>
            <option value="mostrar">Mostrar tudo (Sem avisos de conteúdo)</option>
          </select>
        </div>

        {/* Preferência de Feed por Defeito */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold flex items-center gap-2">
            <Sliders size={20} className="text-black/80" />
            Ordenação Padrão do Feed
          </label>
          <select className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 outline-none cursor-pointer text-sm">
            <option value="cronologico">Mais recentes primeiro (Cronológico)</option>
            <option value="trending">Tendências (Posts a mexer com a Banda hoje)</option>
            <option value="populares">Mais apoiados do mês</option>
          </select>
        </div>

        <button className="btn-secondary w-full sm:w-auto self-start">
          Salvar Filtros de Conteúdo
        </button>
      </div>

      {/* Card Informativo Extra (Segurança Comunitária) */}
      <div className="card border border-amber-500/20 bg-amber-50/20 rounded-2xl p-6 flex flex-col gap-2">
        <h3 className="font-semibold text-amber-700 dark:text-amber-500 flex items-center gap-2 text-sm">
          <Eye size={18} /> Nota sobre Moderação Autônoma
        </h3>
        <p className="text-xs text-zinc-600 leading-relaxed">
          O Anônimo Angola promove a liberdade de partilha e desabafo mútuo, mas não tolera ameaças reais, partilha de dados privados (doxxing) ou calúnias graves. O uso abusivo ou relatórios constantes do nosso sistema de inteligência comunitária podem resultar na suspensão permanente da conta.
        </p>
      </div>
    </motion.div>
  );
}
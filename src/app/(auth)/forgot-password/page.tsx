"use client";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "14px",
  padding: "11px 16px",
  outline: "none",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "0.875rem",
  color: "#1e1e1e",
};

export default function ForgotPassword() {
  return (
    <div className="w-full p-8 max-lg:px-6 max-lg:py-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl" style={{ background: "rgba(133,204,132,0.15)", color: "#3d9c3c" }}>
              <KeyRound size={18} />
            </span>
            <h1 className="font-bold text-2xl text-gray-900">Recuperar Senha</h1>
          </div>
          <p className="text-sm text-gray-500">Insira o seu número de telefone para receber instruções.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Número de telefone</label>
          <input type="text" placeholder="+244923456789" style={inputStyle} />
        </div>

        <button className="btn-primary">Enviar instruções</button>

        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors duration-200 cursor-pointer">
          <ArrowLeft size={14} />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

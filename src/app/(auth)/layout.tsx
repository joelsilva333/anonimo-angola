import type { Metadata } from "next";
import AuthLeftSlider from "./ui/AuthLeftSlider";

export const metadata: Metadata = {
  title: "Autenticação",
  description: "Aceda à sua conta anónima no Anônimo Angola.",
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      {/* Coluna esquerda: slider de imagens */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <AuthLeftSlider />
        {/* Overlay com gradiente + copy */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-10"
          style={{
            background: "linear-gradient(to top, rgba(30,30,30,0.72) 0%, transparent 55%)",
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full mb-3 w-fit"
            style={{ background: "rgba(133,204,132,0.25)", color: "#c8f5c7", border: "1px solid rgba(133,204,132,0.35)" }}
          >
            🛡 100% Anónimo
          </span>
          <h2 className="text-3xl font-bold text-white leading-snug mb-2">
            A sua voz importa.<br />Mesmo que seja anônima.
          </h2>
          <p className="text-white/60 text-sm">
            Junte-se a milhares de angolanos que partilham e apoiam-se mutuamente.
          </p>
        </div>
      </div>

      {/* Coluna direita: formulário */}
      <div
        className="flex-1 flex flex-col justify-center items-center relative"
        style={{
          background: "linear-gradient(135deg, #f0f2f0 0%, #e8f0e8 100%)",
        }}
      >
        {/* Orb decorativo */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: 220,
            height: 220,
            background: "radial-gradient(circle, rgba(133,204,132,0.20) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "5%",
            width: 160,
            height: 160,
            background: "radial-gradient(circle, rgba(133,204,132,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Card do formulário */}
        <div
          className="w-full max-w-md relative z-10 rounded-3xl shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.50)",
          }}
        >
          {children}
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center z-10" style={{ fontFamily: "'Raleway', sans-serif" }}>
          © {new Date().getFullYear()} Anônimo Angola · Joel Silva
        </p>
      </div>
    </div>
  );
}

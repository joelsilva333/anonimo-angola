import type { Metadata } from "next";
import Header from "../ui/Header";
import Footer from "../ui/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://anonimo-angola.vercel.app/"),
  title: { default: "Anônimo Angola", template: "%s | Anônimo Angola" },
  description: "Anônimo Angola é a plataforma segura para desabafos anônimos, confidenciais e sem julgamentos em Angola.",
  authors: [{ name: "Joel Silva" }],
  creator: "Joel Silva",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Hero section elegante – só na landing pública */}
      <div
        className="w-full flex flex-col items-center pb-12"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        {/* Glowing orbs de fundo */}
        <div
          style={{
            position: "fixed",
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(133,204,132,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Conteúdo centralizado */}
        <div className="max-w-2xl w-full flex items-center flex-col gap-5 max-lg:px-4 relative z-10">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}

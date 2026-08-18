import type { Metadata } from "next";
import Header from "../ui/Header";
import Footer from "../ui/Footer";

export const metadata: Metadata = {
  title: { default: "Feed", template: "%s | Anônimo Angola" },
  description: "O seu feed personalizado de desabafos anônimos.",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Raleway', sans-serif",
      }}>
      <Header />

      <div
        className="w-full flex-1 flex flex-col items-center pb-12"
        style={{
          background: "linear-gradient(160deg, #f0f2f0 0%, #e8f0e8 100%)",
          backgroundAttachment: "fixed",
        }}>
        {/* Glow suave de fundo */}
        <div
          style={{
            position: "fixed",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(133,204,132,0.12) 0%, transparent 68%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="max-w-2xl w-full flex items-center flex-col gap-5 max-lg:px-4 relative z-10">
          {children}
        </div>
      </div>
      {/* 
      <Footer /> */}
    </div>
  );
}

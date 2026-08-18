import type { Metadata } from "next";
import AuthLeftSlider from "./ui/AuthLeftSlider";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Autenticação",
  description: "Aceda à sua conta anónima no Anônimo Angola.",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="h-screen flex"
      style={{ fontFamily: "'Raleway', sans-serif" }}>
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <AuthLeftSlider />
        <div className="absolute inset-0 flex flex-col justify-between p-10 z-10 bg-linear-to-t from-black/80 to-black/40">
          <Link href={"/"}>
            <Image
              src={"/logos/white-bg-none.png"}
              alt={""}
              width={130}
              height={80}
            />{" "}
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug ">
              A sua voz importa.
              <br />
              Mesmo que seja anônima.
            </h2>
            <p className="text-white/60 text-sm">
              Junte-se a milhares de angolanos que partilham e apoiam-se
              mutuamente.
            </p>
            <p
              className="text-xs text-gray-400"
              style={{ fontFamily: "'Raleway', sans-serif" }}>
              © {new Date().getFullYear()} Anônimo Angola · Joel Silva
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex-1 flex flex-col justify-center items-center relative"
        style={{
          background: "linear-gradient(135deg, #f0f2f0 0%, #e8f0e8 100%)",
        }}>
        <ToastContainer theme="colored" />
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: 220,
            height: 220,
            background:
              "radial-gradient(circle, rgba(133,204,132,0.20) 0%, transparent 70%)",
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
            background:
              "radial-gradient(circle, rgba(133,204,132,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          className="w-full max-w-md relative z-10 lg:rounded-3xl lg:shadow-lg max-lg:h-full max-lg:flex max-lg:items-center"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.50)",
          }}>
          {children}
        </div>
      </div>
    </div>
  );
}

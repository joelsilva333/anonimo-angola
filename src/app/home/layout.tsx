import type { Metadata } from "next";
import Header from "./ui/Header";
import Footer from "./ui/Footer";

export const metadata: Metadata = {
  title: "Anônimo Angola",
  description: "Uma plataforma para desabafos anônimos em Angola",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div className="flex flex-col items-center min-h-screen bg-background pb-8">
        <div className="max-w-2xl w-full flex items-center flex-col gap-5 max-lg:px-4">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}

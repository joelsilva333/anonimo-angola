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
      
      {children}
      <Footer />
    </div>
  );
}

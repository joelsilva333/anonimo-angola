import type { Metadata } from "next";
import AuthGuard from "../ui/AuthGuard";
import AdminGuard from "../ui/AdminGuard";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminMobileNav from "./components/AdminMobileNav";

export const metadata: Metadata = {
  title: { default: "Painel Admin", template: "%s | Anônimo Angola" },
  description: "Painel administrativo da Anônimo Angola.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "#f4f5f7" }}>
      <AuthGuard />
      <AdminGuard />
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <AdminMobileNav />
        <main className="flex-1 p-5 lg:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

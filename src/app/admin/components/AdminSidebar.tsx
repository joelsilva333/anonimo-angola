"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 w-64 h-screen sticky top-0 py-6 px-4 gap-1"
      style={{
        background: "#14161a",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'Raleway', sans-serif",
      }}>
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
          style={{ background: "#85cc84" }}>
          AA
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-white">Anônimo Angola</span>
          <span className="text-[11px] text-white/40">Painel Admin</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/85 hover:bg-white/5"
              }`}
              style={isActive ? { background: "rgba(133,204,132,0.16)" } : undefined}>
              <Icon size={17} className={isActive ? "text-secondary" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link
          href="/home"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/85 hover:bg-white/5 transition-all duration-200">
          <ArrowLeft size={17} />
          Voltar à app
        </Link>
      </div>
    </aside>
  );
}

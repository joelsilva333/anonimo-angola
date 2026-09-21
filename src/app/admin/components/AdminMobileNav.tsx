"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

export default function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden flex items-center gap-1 px-3 py-2 overflow-x-auto"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        fontFamily: "'Raleway', sans-serif",
      }}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-secondary/15 text-secondary"
                : "text-gray-500 hover:bg-black/5"
            }`}>
            <Icon size={13} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

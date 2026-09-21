import { LayoutDashboard, Users, Flag, ShieldAlert, HeartHandshake, LucideIcon } from "lucide-react";

interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Utilizadores", icon: Users },
  { href: "/admin/reports", label: "Denúncias", icon: Flag },
  { href: "/admin/violations", label: "Violações", icon: ShieldAlert },
  { href: "/admin/support", label: "Suporte", icon: HeartHandshake },
];

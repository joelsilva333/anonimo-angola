"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut } from "lucide-react";
import Cookies from "universal-cookie";
import { useUser } from "@/app/hooks/user";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";
import { api } from "@/app/api/config";
import { getSocket } from "@/app/lib/socket";
import NotificationModal from "@/app/ui/NotificationModal";
import Image from "next/image";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Utilizadores",
  "/admin/reports": "Denúncias",
  "/admin/violations": "Violações de moderação",
  "/admin/support": "Suporte",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const title =
    TITLES[pathname] ||
    Object.entries(TITLES).find(([href]) => pathname.startsWith(href))?.[1] ||
    "Painel Admin";

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/notification/unread-count");
        setUnreadCount(
          response.data.count ?? response.data.unreadCount ?? response.data,
        );
      } catch (error) {
        console.error("Erro ao carregar contagem de alertas:", error);
      }
    };
    fetchUnreadCount();
  }, [notifOpen]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = () => setUnreadCount((prev) => prev + 1);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    new Cookies().remove("aa_token", { path: "/" });
    router.push("/login");
  };

  return (
    <header
      className="w-full flex items-center justify-between px-6 lg:px-8 py-4 sticky top-0 z-20"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        fontFamily: "'Raleway', sans-serif",
      }}>
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>

      <div ref={containerRef} className="flex items-center gap-3 relative">
        <button
          onClick={() => setNotifOpen((prev) => !prev)}
          className="p-2 rounded-full relative cursor-pointer transition-all duration-200 text-gray-500 hover:bg-black/5"
          title="Alertas">
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 flex justify-center items-center bg-red-500 rounded-full animate-pulse text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
          <Bell size={18} />
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              className="absolute right-0 top-12 z-20"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}>
              <NotificationModal setOpen={setNotifOpen} />
            </motion.div>
          )}
        </AnimatePresence>

        {user && (
          <div className="flex items-center gap-2.5">
            {user.profile_picture && (
              <Image
                src={getProfilePictureUrl(user.profile_picture)}
                width={32}
                height={32}
                unoptimized
                alt={user.anon_name}
                className="rounded-full object-cover w-8 h-8"
              />
            )}
            <span className="text-sm font-semibold text-gray-800 max-sm:hidden">
              {user.anon_name}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          title="Terminar sessão">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

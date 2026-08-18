"use client";

import { Bell, Search, Menu as MenuIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Menu from "./Menu";
import { useUser } from "@/app/hooks/user";
import { motion, AnimatePresence } from "framer-motion";
import { getProfilePictureUrl } from "../utils/getProfilePicture";
import NotificationModal from "./NotificationModal";
import { api } from "../api/config";

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const [isNotifOpen, setNotifOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notification/unread-count");
      setUnreadCount(
        response.data.count ?? response.data.unreadCount ?? response.data,
      );
    } catch (error) {
      console.error("Erro ao carregar contagem:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchUnreadCount();
    }
  }, [isNotifOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setNotifOpen(false);
        setMobileNavOpen(false);
      }
    };

    if (isMenuOpen || isNotifOpen || isMobileNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isNotifOpen, isMobileNavOpen]);

  const toggleMenu = () => {
    setNotifOpen(false);
    setMobileNavOpen(false);
    setMenuOpen(!isMenuOpen);
  };
  const toggleNotification = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    setNotifOpen(!isNotifOpen);
  };
  const toggleMobileNav = () => {
    setMenuOpen(false);
    setNotifOpen(false);
    setMobileNavOpen(!isMobileNavOpen);
  };

  const { user, loading } = useUser();

  const isAuthenticated = (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("user_data");
    }
    return false;
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full px-10 py-3 max-lg:px-5 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-sm shadow-black/5"
            : "backdrop-blur-md bg-white/40 border-b border-white/20"
        }`}
        style={{ fontFamily: "'Raleway', sans-serif" }}>
        {/* Logo + Busca */}
        <div className="flex items-center gap-6 max-w-lg w-full">
          <Link href={isAuthenticated() ? "/home" : "/"}>
            <Image
              src={"/logos/bg-none.png"}
              width={120}
              height={44}
              unoptimized
              alt="Anônimo Angola Logo"
              className="w-32 object-contain max-lg:w-24"
            />
          </Link>

          {isAuthenticated() && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center gap-2 max-lg:hidden"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.40)",
                borderRadius: "14px",
                padding: "8px 16px",
              }}>
              <Search
                size={16}
                className="text-gray-500 shrink-0"
              />
              <input
                type="text"
                placeholder="Pesquisar desabafos..."
                style={{
                  background: "transparent",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.875rem",
                  fontFamily: "'Raleway', sans-serif",
                  fontWeight: 400,
                  color: "#1e1e1e",
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Autenticado: sino + avatar */}
        {isAuthenticated() && (
          <div
            ref={containerRef}
            className="flex gap-4 relative w-full max-w-xs items-center justify-end">
            {/* Sino */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotification}
              className="p-2 rounded-full relative cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex justify-center items-center bg-secondary rounded-full animate-pulse text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
              <Bell
                size={18}
                className="text-gray-700"
              />
            </motion.button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  className="absolute right-12 top-12 z-20"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}>
                  <NotificationModal setOpen={setNotifOpen} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="cursor-pointer ring-2 ring-white/60 rounded-full transition-all duration-200 hover:ring-secondary/40">
              {user?.profile_picture && (
                <Image
                  src={getProfilePictureUrl(user.profile_picture)}
                  width={36}
                  height={36}
                  unoptimized
                  alt={user.anon_name}
                  className="rounded-full bg-gray-200 w-9 h-9 object-cover"
                />
              )}
            </motion.button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="absolute right-0 top-12 w-fit z-20"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}>
                  <Menu
                    setMenuClosed={setMenuOpen}
                    user={user}
                    loading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Não autenticado: nav */}
        {!isAuthenticated() && (
          <div
            ref={containerRef}
            className="relative">
            <button
              onClick={toggleMobileNav}
              className="hidden max-lg:flex p-2 text-gray-700 rounded-xl transition-colors cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}>
              {isMobileNavOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>

            <nav
              className={`
              max-lg:absolute max-lg:right-0 max-lg:top-12 max-lg:p-4 max-lg:rounded-2xl max-lg:w-68
              max-lg:shadow-xl max-lg:border
              ${isMobileNavOpen ? "max-lg:block" : "max-lg:hidden"}
            `}
              style={
                isMobileNavOpen
                  ? {
                      background: "rgba(255,255,255,0.80)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.40)",
                    }
                  : {}
              }>
              <ul className="flex gap-2 items-center max-lg:flex-col max-lg:items-stretch max-lg:gap-3">
                <li className="w-full">
                  <Link
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="btn-primary block text-center whitespace-nowrap text-sm">
                    Entrar na minha conta
                  </Link>
                </li>
                <li className="w-full">
                  <Link
                    href="/register"
                    onClick={() => setMobileNavOpen(false)}
                    className="btn-secondary block text-center whitespace-nowrap text-sm">
                    Criar perfil anônimo grátis
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </motion.header>
    </>
  );
}

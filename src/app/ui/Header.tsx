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
import useGetNotifications from "../hooks/get-notifications";
import { api } from "../api/config";

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const [isNotifOpen, setNotifOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Referência do container do menu e notificações para detectar cliques fora
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // FECHAR MODAIS AO CLICAR FORA (Click Outside Hook)
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

    // Adiciona o listener quando algum modal estiver aberto
    if (isMenuOpen || isNotifOpen || isMobileNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup ao desmontar ou fechar
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const menuVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
  };

  const isAuthenticated = (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("user_data");
    }
    return false;
  };

  return (
    <>
      <header className="bg-background-secondary w-full px-16 py-2 max-lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8 max-w-lg w-full">
          <Link href={isAuthenticated() ? "/home" : "/"}>
            <Image
              src={"/logos/bg-none.png"}
              width={100}
              height={44}
              unoptimized
              alt="Anônimo Angola Logo"
              className="w-36 object-contain max-lg:w-24"
            />
          </Link>

          {isAuthenticated() && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 w-full max-lg:hidden">
              <Search className="text-gray-600" />
              <input
                type="text"
                placeholder="Pesquisar"
                className="bg-transparent outline-none w-full"
              />
            </div>
          )}
        </div>

        {isAuthenticated() && (
          <div 
            ref={containerRef} // Encapsula a área dos botões e popups
            className="flex gap-6 relative w-full max-w-xs items-center justify-end">
            
            <button
              onClick={() => toggleNotification()}
              className="p-2 rounded-full bg-white/80 hover:bg-gray-200 transition-colors duration-300 cursor-pointer relative">
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 w-5 h-5 flex justify-center items-center bg-red-500 rounded-full animate-pulse text-white text-xs">
                  {unreadCount}
                </span>
              )}
              <Bell className="text-gray-600" />
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  className="absolute right-12 top-11 z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}>
                  <NotificationModal setOpen={setNotifOpen} />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={toggleMenu}
              className="cursor-pointer">
              {user?.profile_picture && (
                <Image
                  src={getProfilePictureUrl(user.profile_picture)}
                  width={385}
                  height={385}
                  unoptimized
                  alt={user.anon_name}
                  className="rounded-full bg-gray-300 w-10"
                />
              )}
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="absolute right-0 top-11 w-fit z-20"
                  variants={menuVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit">
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

        {!isAuthenticated() && (
          <div ref={containerRef} className="relative">
            <button
              onClick={toggleMobileNav}
              className="hidden max-lg:block p-2 text-gray-700 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
              {isMobileNavOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            <nav
              className={`
              max-lg:absolute max-lg:right-0 max-lg:top-10 max-lg:bg-background-secondary max-lg:p-4 max-lg:rounded-xl max-lg:shadow-lg max-lg:w-64 max-lg:border max-lg:border-white/10
              ${isMobileNavOpen ? "max-lg:block" : "max-lg:hidden"}
            `}>
              <ul className="flex gap-2 items-center max-lg:flex-col max-lg:items-stretch max-lg:gap-3">
                <li className="w-full">
                  <Link
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="btn-primary block text-center w-full whitespace-nowrap">
                    Entrar na minha conta
                  </Link>
                </li>

                <li className="w-full">
                  <Link
                    href="/register"
                    onClick={() => setMobileNavOpen(false)}
                    className="btn-secondary block text-center w-full whitespace-nowrap">
                    Criar perfil anônimo gratuito
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
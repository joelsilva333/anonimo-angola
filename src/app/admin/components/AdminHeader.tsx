"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Cookies from "universal-cookie";
import { useUser } from "@/app/hooks/user";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";
import Image from "next/image";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Utilizadores",
  "/admin/reports": "Denúncias",
  "/admin/violations": "Violações de moderação",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

  const title =
    TITLES[pathname] ||
    Object.entries(TITLES).find(([href]) => pathname.startsWith(href))?.[1] ||
    "Painel Admin";

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

      <div className="flex items-center gap-3">
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

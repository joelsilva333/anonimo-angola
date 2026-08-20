import UserInterface from "@/app/interfaces/user";
import { MoveRight, Settings, HeartHandshake, LogOut, User, BookHeart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import Cookies from "universal-cookie";
import { getProfilePictureUrl } from "../utils/getProfilePicture";

interface MenuInterface {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function Menu({
  setMenuClosed,
  user,
}: {
  setMenuClosed: Dispatch<SetStateAction<boolean>>;
  user: UserInterface | null;
  loading: boolean;
}) {
  const router = useRouter();
  const cookies = new Cookies();

  const handleProfileClick = () => { router.push("/home/profile"); setMenuClosed(false); };
  const handleLogout = () => {
    setMenuClosed(false);
    localStorage.removeItem("user_data");
    cookies.remove("aa_token", { path: "/" });
    router.push("/");
  };
  const handleMenuClick = (link: string) => { router.push(link); setMenuClosed(false); };

  const menuItems: MenuInterface[] = [
    {
      title: "Apoio Emocional",
      icon: <HeartHandshake size={16} className="text-secondary" />,
      onClick: () => handleMenuClick("/home/support"),
    },
    {
      title: "Diário Emocional",
      icon: <BookHeart size={16} className="text-secondary" />,
      onClick: () => handleMenuClick("/home/mood-tracker"),
    },
    {
      title: "Definições",
      icon: <Settings size={16} className="text-gray-500" />,
      onClick: () => handleMenuClick("/home/settings"),
    },
  ];

  return (
    <ul
      className="min-w-56 flex flex-col rounded-2xl overflow-hidden shadow-xl"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.40)",
        fontFamily: "'Raleway', sans-serif",
      }}
    >
      {/* Perfil */}
      <li className="border-b border-black/5">
        <button
          onClick={handleProfileClick}
          className="w-full px-4 py-3 transition-colors duration-200 cursor-pointer hover:bg-secondary/8 flex items-center gap-3"
        >
          {user?.profile_picture ? (
            <Image
              src={getProfilePictureUrl(user.profile_picture)}
              width={34}
              height={34}
              unoptimized
              alt={user.anon_name}
              className="rounded-full bg-gray-200 w-9 h-9 object-cover"
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
              <User size={16} className="text-secondary" />
            </span>
          )}
          <span className="flex flex-col items-start">
            <p className="text-sm font-semibold text-gray-900">{user ? user.anon_name : "Usuário Anônimo"}</p>
            <p className="text-xs text-gray-400 font-normal">Ver perfil</p>
          </span>
        </button>
      </li>

      {menuItems.map((item) => (
        <li key={item.title}>
          <button
            onClick={item.onClick}
            className="w-full px-4 py-2.5 transition-colors duration-200 cursor-pointer hover:bg-secondary/8 flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
              {item.icon}
              {item.title}
            </span>
            <MoveRight size={14} className="text-gray-400" />
          </button>
        </li>
      ))}

      <li className="border-t border-black/5">
        <button
          className="w-full px-4 py-2.5 transition-colors duration-200 flex items-center justify-between gap-2 cursor-pointer hover:bg-red-50"
          onClick={handleLogout}
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-red-500">
            <LogOut size={16} />
            Sair
          </span>
          <MoveRight size={14} className="text-red-300" />
        </button>
      </li>
    </ul>
  );
}

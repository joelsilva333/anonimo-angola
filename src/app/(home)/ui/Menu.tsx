import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface MenuInterface {
  title: string;
  onClick?: () => void;
}

export default function Menu({
  setMenuClosed,
}: {
  setMenuClosed: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile/1");
    setMenuClosed(false);
  };

  const handleLogout = () => {
    setMenuClosed(false);
    router.push("/login");
  };

  const handleMenuClick = (link: string) => {
    router.push(link);
    setMenuClosed(false);
  };

  const menuItems: MenuInterface[] = [
    {
      title: "Definições",
      onClick: () => handleMenuClick("/settings"),
    },
  ];

  return (
    <ul className="w-full flex-col flex rounded-xl bg-white px-2 py-4 gap-2 font-semibold hover:shadow-lg transition-shadow duration-300">
      <li>
        <button
          onClick={handleProfileClick}
          className="w-full px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
          <span className="flex items-center gap-2">
            <Image
              src={"/"}
              width={36}
              height={36}
              alt=""
              className="rounded-full bg-gray-500"
            />
            <p className="text-sm">Usuário Anônimo</p>
          </span>
        </button>
      </li>

      {menuItems.map((item) => (
        <li key={item.title}>
          <button
            onClick={item.onClick}
            className="w-full px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 cursor-pointer flex items-center justify-between gap-2">
            {item.title}
            <MoveRight className="text-sm" />
          </button>
        </li>
      ))}

      <li>
        <button
          className="w-full px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 flex items-center justify-between gap-2 text-red-500 cursor-pointer"
          onClick={handleLogout}>
          Sair
          <MoveRight className="text-sm" />
        </button>
      </li>
    </ul>
  );
}

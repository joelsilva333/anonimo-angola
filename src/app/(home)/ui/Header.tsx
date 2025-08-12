import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#D5D5D5] w-full px-16 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8 max-w-lg w-full">
        <Link href="/">
          <Image
            src={"/logos/bg-none.png"}
            width={100}
            height={44}
            alt="Anônimo Angola Logo"
            className="w-36 object-contain"
          />
        </Link>

        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 w-full">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar"
            className="bg-transparent outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ul className="flex items-center gap-4">
          <li>
            <button className="p-2 rounded-full bg-white/80 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
              <Bell className="text-gray-500"/>
            </button>
          </li>
        </ul>

        <button>
          <Image
            alt=""
            src={"/"}
            width={38}
            height={38}
            className="cursor-pointer bg-white rounded-full"
          />
        </button>
      </div>
    </header>
  );
}

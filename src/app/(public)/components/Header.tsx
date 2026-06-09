import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full px-16 py-4 flex items-center justify-between">
      <Link href="/">
        <Image
          src={"/logos/bg-none.png"}
          width={100}
          height={44}
          unoptimized
          alt="Anônimo Angola Logo"
          className="w-36 object-contain max-lg:w-24"
        />
      </Link>

      <nav>
        <ul className="flex gap-2 items-center">
          <li>
            <Link
              href="/login"
              className="btn-primary">
              Entrar na minha conta
            </Link>
          </li>

          <li>
            <Link
              href="/register"
              className="btn-secondary">
              Criar perfil anônimo gratuito
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

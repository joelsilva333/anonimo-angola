import { MoveRight } from "lucide-react";
import Link from "next/link";

interface MenuOptionsInterface {
  title: string;
  description: string;
  link: string;
}

export default function MenuOption({
  description,
  link,
  title,
}: MenuOptionsInterface) {
  return (
    <Link
      href={link}
      className="w-full flex items-center justify-between gap-2 min-h-25 card">
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-xl font-semibold">{title}</h1>

        <p className="text-base text-gray-700">{description}</p>
      </div>

      <MoveRight />
    </Link>
  );
}

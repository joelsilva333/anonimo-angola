import {
  EllipsisVertical,
  Forward,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  return (
    <>
      <div className="w-full flex items-center gap-8 bg-[#595959] p-8">
        <Image
          src={"/"}
          width={150}
          height={150}
          alt="Joel"
          className="rounded-2xl bg-gray-300"
        />

        <h1 className="font-semibold text-2xl text-white">
          Usuário Anônimo {profileId}
        </h1>
      </div>

      <h1 className="text-lg font-bold text-left w-full">MEUS DESABAFOS</h1>

      <div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={"/"}
              width={44}
              height={44}
              alt=""
              className="rounded-full bg-gray-500"
            />
            <span className="flex flex-col">
              <p className="text-lg font-semibold">Usuário Anônimo</p>
              <p className="text-sm text-[#757575]">Há 2 horas</p>
            </span>
          </div>

          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
            <EllipsisVertical className="text-[#757575]" />
          </button>
        </div>

        <p className="text-lg">
          Este é um exemplo de desabafo anônimo. Sinta-se à vontade para
          compartilhar suas histórias e experiências aqui. A plataforma é
          totalmente anônima e segura.
        </p>

        <ul className="flex items-center justify-between gap-4 font-semibold text-lg mt-4">
          <li className="w-full">
            <button className="w-full flex justify-center items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 gap-2 cursor-pointer">
              <ThumbsUp /> Gosto
            </button>
          </li>
          <li className="w-full">
            <button className="flex w-full justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 items-center gap-2 cursor-pointer">
              <MessageCircle />
              Comentar
            </button>
          </li>
          <li className="w-full">
            <button className="flex hover:bg-gray-100 w-full justify-center items-center p-2 rounded-md transition-colors duration-300 gap-2 cursor-pointer">
              <Forward />
              Partilhar
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

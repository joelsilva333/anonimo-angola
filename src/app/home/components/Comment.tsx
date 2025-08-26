import { EllipsisVertical, MessageCircle, ThumbsUp } from "lucide-react";
import Image from "next/image";
/* import TimeAgo from "react-timeago"; */

export default function Comment() {
  return (
    <li className="w-full flex flex-col gap-4 bg-gray-50 p-4 rounded-md items-start">
      <div className="flex gap-2 max-lg:text-sm items-center justify-between w-full">
        <span className="flex gap-3 items-center">
          <Image
            src={"/"}
            width={50}
            height={50}
            unoptimized
            alt="Profile Picture"
            className="rounded-full bg-gray-300 max-lg:w-12 max-lg:h-12 w-10 h-10"
          />
          <p className="text-sm font-semibold">Usuário Anônimo</p>
          <span className="text-xs">•</span>
          <p className="text-sm text-[#757575]">
            há duas horas
            {/*  <TimeAgo
                date={post.created_at}
                formatter={customFormatter}
              /> */}
          </p>
        </span>

        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
          <EllipsisVertical className="text-[#757575] w-5" />
        </button>
      </div>

      <p className="text-sm">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deserunt
        natus, reiciendis hic delectus a distinctio eveniet voluptatibus quia
        cumque fuga praesentium. Aut consectetur doloremque aperiam quia, in
        tempora magnam dignissimos.
      </p>

      <div className="flex items-center w-full font-semibold text-sm">
        <button className=" flex justify-center items-center px-4 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-2 cursor-pointer">
          <ThumbsUp className="w-4" />{" "}
          <span className="max-lg:text-sm max-lg:hidden">Gosto</span>
        </button>

        <button className=" flex justify-center items-center px-4 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-2 cursor-pointer">
          <MessageCircle className="w-4" />
          <span className="max-lg:text-sm max-lg:hidden">Responder</span>
        </button>
      </div>
    </li>
  );
}

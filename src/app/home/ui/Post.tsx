/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostInterface } from "@/app/interfaces/post";
import {
  EllipsisVertical,
  Forward,
  MessageCircle,
  Send,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import TimeAgo from "react-timeago";
import ptBRStrings from "react-timeago/lib/language-strings/pt";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import Skeleton from "../components/Skeleton";
import Comment from "../components/Comment";

const customFormatter = (
  value: number,
  unit: string,
  suffix: string,
  epochMilliseconds: number,
  nextFormatter: any,
  now: () => number
) => {
  if (unit === "second" && value < 60) {
    return "agora mesmo";
  }
  const formatter = buildFormatter(ptBRStrings);
  return formatter(
    value,
    unit as any,
    suffix as any,
    epochMilliseconds,
    nextFormatter,
    now
  );
};

export default function Post({ post }: { post: PostInterface }) {
  if (!post) {
    return (
      <div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton
              circle
              width={50}
              height={50}
            />
            <span className="flex flex-col w-full">
              <Skeleton
                width="60%"
                height={20}
              />
              <Skeleton
                width="40%"
                height={15}
              />
            </span>
          </div>
          <Skeleton
            width={30}
            height={30}
          />
        </div>

        <Skeleton
          width="100%"
          height={20}
          className="mt-4"
        />
        <Skeleton
          width="100%"
          height={15}
          className="mt-2"
        />

        <ul className="flex items-center justify-between gap-4 font-semibold text-lg mt-4">
          <li className="w-full">
            <Skeleton
              width="100%"
              height={40}
            />
          </li>
          <li className="w-full">
            <Skeleton
              width="100%"
              height={40}
            />
          </li>
          <li className="w-full">
            <Skeleton
              width="100%"
              height={40}
            />
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 max-lg:gap-3">
          {post.profile_picture && (
            <Image
              src={post.profile_picture}
              width={50}
              height={50}
              unoptimized
              alt="Profile Picture"
              className="rounded-full bg-gray-300 max-lg:w-12"
            />
          )}

          <span className="flex flex-col max-lg:text-sm">
            <p className="lg:text-lg font-semibold">{post.anon_name}</p>
            <p className="text-sm text-[#757575]">
              <TimeAgo
                date={post.created_at}
                formatter={customFormatter}
              />
            </p>
          </span>
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
          <EllipsisVertical className="text-[#757575]" />
        </button>
      </div>

      <p
        className={`max-lg:text-base ${
          post.text.length < 100
            ? "text-3xl max-lg:text-xl"
            : "text-lg max-lg:text-base"
        }`}>
        {post.text}
      </p>

      <div className="flex flex-col gap-2">
        <hr className="border border-gray-200" />

        <ul className="flex items-center justify-between gap-4 font-semibold">
          <li className="w-full">
            <button className="w-full flex justify-center items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 gap-2 cursor-pointer">
              <ThumbsUp className="w-5" />{" "}
              <span className="max-lg:text-sm max-lg:hidden">Gosto</span>
            </button>
          </li>
          <li className="w-full">
            <button className="flex w-full justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 items-center gap-2 cursor-pointer">
              <MessageCircle className="w-5" />
              <span className="max-lg:text-sm max-lg:hidden">Comentar</span>
            </button>
          </li>
          <li className="w-full">
            <button className="flex hover:bg-gray-100 w-full justify-center items-center p-2 rounded-md transition-colors duration-300 gap-2 cursor-pointer">
              <Forward className="w-5" />
              <span className="max-lg:text-sm max-lg:hidden">Partilhar</span>
            </button>
          </li>
        </ul>

        <hr className="border border-gray-200" />
      </div>

      <div>
        <Comment />
      </div>

      <form className="flex items-center bg-gray-50">
        <input
          className="outline-none w-full  p-4 resize-none"
          type="text"
          placeholder="Adicionar um comentário..."
        />
        <button
          type="submit"
          className="px-4 py-2 hover:bg-gray-200 rounded-md cursor-pointer flex  gap-2">
          Enviar <Send className="hidden" />
        </button>
      </form>
    </div>
  );
}

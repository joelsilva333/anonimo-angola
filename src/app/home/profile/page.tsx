"use client";

import { useGetUserPosts } from "@/app/hooks/post";
import Image from "next/image";
import Post from "../ui/Post";
import { useUser } from "@/app/hooks/user";

export default function ProfilePage() {
  const { userPosts: posts } = useGetUserPosts();
  const { user } = useUser();

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

        <h1 className="font-semibold text-2xl text-white">{user?.anon_name}</h1>
      </div>

      <h1 className="text-lg font-bold text-left w-full">MEUS DESABAFOS</h1>

      <div className="w-full flex flex-col gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">
            Nenhum desabafo encontrado.
          </p>
        )}
      </div>
    </>
  );
}

"use client";

import { useGetUserPosts } from "@/app/hooks/post";
import Image from "next/image";
import Post from "../ui/Post";
import { useUser } from "@/app/hooks/user";

export default function ProfilePage() {
  const { userPosts: posts, refetch } = useGetUserPosts();
  const { user } = useUser();

  return (
    <>
      <div className="w-full flex items-center gap-8 bg-gradient-to-r from-[#4B6D94] to-[#10192B] p-8 max-lg:gap-4 max-lg:p-4 max-lg:min-h-44">
        {user?.profile_picture && (
          <Image
            src={user.profile_picture}
            width={150}
            unoptimized
            height={150}
            alt="Joel"
            className="rounded-2xl bg-gray-300 max-lg:w-24"
          />
        )}

        <h1 className="font-semibold text-2xl text-white max-lg:text-xl">
          {user?.anon_name}
        </h1>
      </div>

      <h1 className="text-lg font-bold text-left w-full">MEUS DESABAFOS</h1>

      <div className="w-full flex flex-col gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              refetch={refetch}
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

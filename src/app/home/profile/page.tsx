"use client";

import { useState } from "react";
import { useGetUserPosts } from "@/app/hooks/post";
import Image from "next/image";
import Post from "../../ui/Post";
import { PostSkeletonList } from "../../ui/PostSkeleton";
import FollowListModal from "../../ui/FollowListModal";
import { useUser, useUserProfile } from "@/app/hooks/user";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";

export default function ProfilePage() {
  const { userPosts: posts, loading, error, refetch } = useGetUserPosts();
  const { user } = useUser();
  const { profile } = useUserProfile(user?.id);
  const [listModal, setListModal] = useState<"followers" | "following" | null>(
    null,
  );

  return (
    <>
      <div className="w-full flex items-center gap-8 bg-gradient-to-r from-[#4B6D94] to-[#10192B] p-8 max-lg:gap-4 max-lg:p-4 max-lg:min-h-44">
        {user?.profile_picture && (
          <Image
            src={getProfilePictureUrl(user.profile_picture)}
            width={150}
            unoptimized
            height={150}
            alt="Joel"
            className="rounded-2xl bg-gray-300 object-cover w-37.5 h-37.5 max-lg:w-24 max-lg:h-24"
          />
        )}

        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-2xl text-white max-lg:text-xl">
            {user?.anon_name}
          </h1>

          {profile && (
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span>
                <strong className="text-white">{posts.length}</strong> desabafos
              </span>
              <button
                onClick={() => setListModal("followers")}
                className="cursor-pointer hover:text-white transition-colors">
                <strong className="text-white">
                  {profile.followersCount}
                </strong>{" "}
                seguidores
              </button>
              <button
                onClick={() => setListModal("following")}
                className="cursor-pointer hover:text-white transition-colors">
                <strong className="text-white">
                  {profile.followingCount}
                </strong>{" "}
                a seguir
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-lg font-bold text-left w-full">MEUS DESABAFOS</h1>

      <div className="w-full flex flex-col gap-4">
        {loading || error ? (
          <PostSkeletonList />
        ) : posts.length > 0 ? (
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

      {listModal && user && (
        <FollowListModal
          userId={user.id}
          type={listModal}
          onClose={() => setListModal(null)}
        />
      )}
    </>
  );
}

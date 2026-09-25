"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, MessageCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useGetPostsByUserId } from "@/app/hooks/post";
import { useUser, useUserProfile } from "@/app/hooks/user";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";
import Post from "../../../ui/Post";
import { PostSkeletonList } from "../../../ui/PostSkeleton";
import FollowButton from "../../../ui/FollowButton";
import BlockButton from "../../../ui/BlockButton";
import FollowListModal from "../../../ui/FollowListModal";

export default function ProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const router = useRouter();
  const { user } = useUser();
  const isOwnProfile = !!user && user.id === profileId;

  useEffect(() => {
    if (isOwnProfile) router.replace("/home/profile");
  }, [isOwnProfile, router]);

  const {
    profile,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile(isOwnProfile ? undefined : profileId);

  const { userPosts: posts, loading, error, refetch } = useGetPostsByUserId(
    isOwnProfile ? undefined : profileId,
  );

  const [listModal, setListModal] = useState<"followers" | "following" | null>(
    null,
  );

  const requireAuth = () => {
    if (typeof window !== "undefined" && localStorage.getItem("user_data")) {
      return true;
    }
    toast.info("Precisas de uma conta para seguir outros perfis.");
    router.push("/login");
    return false;
  };

  if (isOwnProfile) return null;

  const anonName = profile?.anon_name || "Usuário Anônimo";
  const profilePicture = profile?.profile_picture;

  return (
    <>
      <div className="w-full flex items-center gap-8 bg-gradient-to-r from-[#4B6D94] to-[#10192B] p-8 max-lg:gap-4 max-lg:p-4 max-sm:flex-col max-sm:text-center max-sm:py-6">
        {profilePicture ? (
          <Image
            src={getProfilePictureUrl(profilePicture)}
            width={150}
            unoptimized
            height={150}
            alt={anonName}
            className="rounded-2xl bg-gray-300 w-37.5 h-37.5 max-lg:w-24 max-lg:h-24 object-cover"
          />
        ) : (
          <span className="w-[150px] h-[150px] max-lg:w-24 max-lg:h-24 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <User
              size={48}
              className="text-white/70"
            />
          </span>
        )}

        <div className="flex flex-col gap-3 max-sm:items-center min-w-0">
          <h1 className="font-semibold text-2xl text-white max-lg:text-xl truncate max-w-full">
            {anonName}
          </h1>

          {!profileLoading && profile && (
            <div className="flex items-center gap-4 text-sm text-white/80 flex-wrap justify-center">
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

          {!profileLoading && profile && (
            <div className="flex items-center gap-2">
              <FollowButton
                userId={profile.id}
                initialFollowing={profile.isFollowing}
                requireAuth={requireAuth}
              />
              <Link
                href={user ? `/home/messages/new/${profile.id}` : "#"}
                onClick={(e) => {
                  if (!requireAuth()) e.preventDefault();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.30)",
                }}>
                <MessageCircle size={16} />
              </Link>
              <BlockButton
                userId={profile.id}
                anonName={profile.anon_name}
                initialBlocked={profile.isBlocked}
                onChange={() => refetchProfile()}
                requireAuth={requireAuth}
              />
            </div>
          )}
        </div>
      </div>

      <h1 className="text-lg font-bold text-left w-full">DESABAFOS</h1>

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

      {listModal && profile && (
        <FollowListModal
          userId={profile.id}
          type={listModal}
          onClose={() => {
            setListModal(null);
            refetchProfile();
          }}
        />
      )}
    </>
  );
}

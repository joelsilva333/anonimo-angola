"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { api } from "@/app/api/config";

export default function FollowButton({
  userId,
  initialFollowing,
  onChange,
  requireAuth,
}: {
  userId: string;
  initialFollowing: boolean;
  onChange?: (following: boolean) => void;
  requireAuth: () => boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!requireAuth()) return;

    const previous = following;
    setFollowing(!previous);
    setLoading(true);
    try {
      const response = await api.post(`/users/${userId}/follow`);
      setFollowing(response.data.following);
      onChange?.(response.data.following);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFollowing(previous);
      toast.error(
        error?.response?.data?.error || "Erro ao seguir. Tenta novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 ${
        following
          ? "bg-white/15 text-white border border-white/30 hover:bg-white/25"
          : "text-white"
      }`}
      style={
        following
          ? {}
          : { background: "#85cc84", border: "1px solid #6db86c" }
      }>
      {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {following ? "A seguir" : "Seguir"}
    </motion.button>
  );
}

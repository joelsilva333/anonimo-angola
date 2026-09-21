"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { api } from "@/app/api/config";
import { getProfilePictureUrl } from "@/app/utils/getProfilePicture";

interface FollowItem {
  id: string;
  anon_name: string;
  profile_picture: string;
}

export default function FollowListModal({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}) {
  const [items, setItems] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/users/${userId}/${type}`)
      .then((response) => {
        if (active) setItems(response.data.items || []);
      })
      .catch((err) => console.error("Erro ao carregar lista:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, type]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)" }}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-sm w-full max-h-[70vh] flex flex-col p-6"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.55)",
            borderRadius: "28px",
            boxShadow: "0 24px 64px rgba(30,30,30,0.20)",
            fontFamily: "'Raleway', sans-serif",
          }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors duration-200 cursor-pointer hover:bg-black/5">
            <FaTimes />
          </button>

          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {type === "followers" ? "Seguidores" : "A seguir"}
          </h3>

          <div className="flex flex-col gap-1 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-center text-gray-400 py-6">
                A carregar...
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-center text-gray-400 py-6">
                {type === "followers"
                  ? "Ainda sem seguidores."
                  : "Ainda não segue ninguém."}
              </p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/home/profile/${item.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/5 transition-colors duration-200">
                  {item.profile_picture && (
                    <Image
                      src={getProfilePictureUrl(item.profile_picture)}
                      width={36}
                      height={36}
                      unoptimized
                      alt={item.anon_name}
                      className="rounded-full object-cover w-9 h-9"
                    />
                  )}
                  <p className="text-sm font-semibold text-gray-800">
                    {item.anon_name}
                  </p>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/public/avatars/**",
      },
      {
        protocol: "https",
        hostname: "anonimo-angola-api.onrender.com",
        port: "",
        pathname: "/public/avatars/**",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;

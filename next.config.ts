import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Film-strip thumbnails only need small sizes
    imageSizes: [96, 192],
  },
};

export default nextConfig;

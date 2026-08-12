import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "localhost:81",
    "*.space-z.ai",
    "preview-chat-ceb88da3-513f-4e96-a4ce-3e2909f9476f.space-z.ai",
  ],
};

export default nextConfig;

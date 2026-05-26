import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: "standalone",
  // MDXEditor is client-only (loaded via dynamic import, ssr: false)
  serverExternalPackages: ["@mdxeditor/editor"],
};

export default nextConfig;

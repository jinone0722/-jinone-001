/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@worksphere/ui", "@worksphere/shared"]
};

export default nextConfig;

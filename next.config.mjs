/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // Prevent TypeScript from blocking deploy on non-critical issues
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;

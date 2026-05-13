/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress Leaflet SSR issues — it uses window
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;

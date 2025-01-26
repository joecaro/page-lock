/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@joecarot/page-lock"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
    };
    return config;
  },
};

module.exports = nextConfig; 
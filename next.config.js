/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.nagradion.ru",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

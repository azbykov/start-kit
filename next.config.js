/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Используем webpack вместо Turbopack (для совместимости с кастомными настройками)
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.nagradion.ru",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // Игнорируем опциональные зависимости pino, которые не установлены
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-elasticsearch": false,
    };

    // Исключаем тестовые файлы из node_modules из сборки
    config.module.rules.push({
      test: /node_modules\/.*\.test\.(js|ts|tsx)$/,
      use: "ignore-loader",
    });

    return config;
  },
};

module.exports = nextConfig;

const {i18n} = require('./next-i18next.config');
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  // Other configurations...

  // Disable the built-in font optimization only in development mode (localhost)
  experimental: {
    optimizeFonts: !isDevelopment,
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n,
    reactStrictMode: true,

    webpack(config, {isServer, dev}) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        return config;
    }
};

module.exports = nextConfig;

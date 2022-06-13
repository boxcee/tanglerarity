/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputStandalone: true,
  },
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/dspyhe3iz/',
  },
};

module.exports = nextConfig;

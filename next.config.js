/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ui-avatars.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig

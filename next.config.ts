/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optional: Add if you need PostCSS
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ueetgnxhw203rpll.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig; 
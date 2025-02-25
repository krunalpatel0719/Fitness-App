/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        domains: ['raw.githubusercontent.com'],
        minimumCacheTTL: 60,
        formats: ['image/webp'],
      },
};

export default nextConfig;

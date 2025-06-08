import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    assetPrefix: '.',
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.mustit.co.kr',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/_next/images/**',
            }

        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
    },
}

export default nextConfig
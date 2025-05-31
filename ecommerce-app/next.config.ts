import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.mustit.co.kr',
                pathname: '/lib/**',
            }
        ],
    },
}

export default nextConfig
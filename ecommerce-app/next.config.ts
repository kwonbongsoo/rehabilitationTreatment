import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    images: {
        domains: ['image.mustit.co.kr'], // 외부 이미지 도메인 허용
        formats: ['image/webp'], // WebP 형식 지원
    },
}

export default nextConfig
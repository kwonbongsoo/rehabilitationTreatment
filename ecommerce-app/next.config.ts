import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // 이미지 최적화 설정
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
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 실험적 기능
  experimental: {
    optimizePackageImports: ['@/components', '@/utils'],
  },

  // API 라우트 프록시 설정
  async rewrites() {
    const kongGatewayUrl = process.env.KONG_GATEWAY_URL || 'http://localhost:8000';

    // 개발환경에서는 디버깅용, 운영환경에서는 fallback용으로 유지
    // 예: /api/gateway/auth/login → http://localhost:8000/api/auth/login
    return [
      {
        source: '/api/gateway/:path*',
        destination: `${kongGatewayUrl}/api/:path*`,
      },
    ];
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

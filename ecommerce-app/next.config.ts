import type { NextConfig } from 'next';

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
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 🔒 보안상 모든 환경에서 개별 프록시 함수 사용하므로 rewrites는 선택적
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
};

export default nextConfig;

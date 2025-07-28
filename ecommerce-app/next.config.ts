import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // removeConsole: false,
  },

  // 빌드 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // React DevTools 관련 경고 억제
    // if (dev && !isServer) {
    //   config.resolve.alias = {
    //     ...config.resolve.alias,
    //     'react-devtools-shared/src/backend/utils': false,
    //   };
    // }
    // 서버 사이드에서 self 전역 변수 폴리필
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // self 전역 변수 폴리필 추가
      config.plugins.push(
        new webpack.DefinePlugin({
          self: 'globalThis',
        }),
      );
    }

    // 번들 분석용 (환경변수로 활성화)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        }),
      );
    }

    // CSS와 JavaScript 최적화
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // CSS 분리 (기존)
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };

    // Tree shaking 최적화
    config.optimization.usedExports = true;
    config.optimization.sideEffects = true;

    return config;
  },

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.kbs-cdn.shop',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kbs-cdn.shop',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image-resizer.star1231076.workers.dev',
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
    minimumCacheTTL: 86400, // 24시간 캐싱
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 이미지 품질과 성능 트레이드오프
    dangerouslyAllowSVG: false,
    // 이미지 최적화 프로세스 개수 제한 (메모리 사용량 감소)
    domains: [],
  },

  // 실험적 기능
  experimental: {
    // 패키지 import 최적화 (Tree shaking)
    optimizePackageImports: [
      '@/components',
      '@/utils',
      '@/hooks',
      'lodash',
      'date-fns',
      'react-icons',
      'zustand',
    ],
    // 정적 최적화
    optimizeServerReact: true,
    // 메모리 최적화
    workerThreads: false,
    // CSS 최적화 활성화 (preload를 위해)
    optimizeCss: true,
    cssChunking: 'strict',
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // 정적 파일 캐싱
  async headers() {
    return [
      // 메인 페이지들에 bfcache 허용 헤더 추가
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
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
      // 정적 자원 캐싱 헤더
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // CSS preload 헤더
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Link',
            value: '</_next/static/css/:path*>; rel=preload; as=style',
          },
        ],
      },
      // JavaScript preload 헤더
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Link',
            value: '</_next/static/chunks/:path*>; rel=preload; as=script',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
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
};

export default nextConfig;

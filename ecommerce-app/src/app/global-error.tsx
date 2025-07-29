'use client';

import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // 글로벌 에러는 심각한 오류이므로 반드시 로깅
    console.error('Global error:', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });

    // 프로덕션에서는 외부 모니터링 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket 등으로 전송
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 text-red-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                심각한 오류 발생
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                애플리케이션에 심각한 문제가 발생했습니다.
                <br />
                페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs text-gray-500">
                  <summary className="cursor-pointer">개발자 정보</summary>
                  <pre className="mt-2 text-left bg-gray-100 p-2 rounded overflow-auto">
                    Error: {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                    {error.stack && `\nStack: ${error.stack}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={reset}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                페이지 새로고침
              </button>
              <a
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                홈으로 이동
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
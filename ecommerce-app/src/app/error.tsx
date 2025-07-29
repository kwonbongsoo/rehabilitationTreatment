'use client';

import React from 'react';
import { normalizeError, getErrorActions, getUserFriendlyMessage } from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const normalizedError = normalizeError(error);
  const userMessage = getUserFriendlyMessage(normalizedError);
  const actions = getErrorActions(normalizedError);

  React.useEffect(() => {
    // 에러 로깅 (프로덕션에서는 외부 서비스로 전송)
    console.error('Client error:', {
      error: normalizedError,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error, normalizedError]);

  const handleAction = (action: typeof actions[0]) => {
    switch (action.action) {
      case 'retry':
        reset();
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'navigate':
        if (action.href) router.push(action.href);
        break;
      case 'login':
        if (action.href) router.push(action.href);
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            오류가 발생했습니다
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {userMessage}
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-xs text-gray-500">
              <summary className="cursor-pointer">개발자 정보</summary>
              <pre className="mt-2 text-left bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify({
                  code: normalizedError.code,
                  statusCode: normalizedError.statusCode,
                  message: error.message,
                  digest: error.digest,
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>

        <div className="mt-8 space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action)}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                action.action === 'retry' || action.action === 'reload'
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
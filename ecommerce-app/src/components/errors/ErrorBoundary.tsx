'use client';
import { Component, ErrorInfo, ReactNode } from 'react';
import { normalizeError, getErrorActions, getUserFriendlyMessage } from '@/utils/errorHandler';

type FallbackRender = (error: Error | null, reset: () => void) => ReactNode;

interface Props {
  children: ReactNode;
  fallback?: ReactNode | FallbackRender;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', onError } = this.props;
    const normalizedError = normalizeError(error);

    // 에러 레벨에 따른 로깅
    console.error(`[ErrorBoundary:${level}] Error caught:`, {
      error: normalizedError,
      errorInfo,
      timestamp: new Date().toISOString(),
    });

    // 커스텀 에러 핸들러 호출
    if (onError) {
      onError(error, errorInfo);
    }

    // 프로덕션에서는 외부 모니터링 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket 등으로 전송
      // logErrorToExternalService(normalizedError, errorInfo, level);
    }
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError && this.state.error) {
      const { fallback, level = 'component' } = this.props;
      const normalizedError = normalizeError(this.state.error);
      const userMessage = getUserFriendlyMessage(normalizedError);
      const actions = getErrorActions(normalizedError);

      // 커스텀 fallback이 있는 경우
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.resetError);
      }
      if (fallback) {
        return fallback;
      }

      // 레벨별 기본 UI
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-4">심각한 오류</h1>
              <p className="text-gray-600 mb-6">{userMessage}</p>
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="flex items-center justify-center min-h-96 p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">페이지 로드 오류</h2>
              <p className="text-gray-600 mb-6">{userMessage}</p>
              <div className="space-x-4">
                <button
                  onClick={this.resetError}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  다시 시도
                </button>
                {actions.some((a) => a.action === 'navigate') && (
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    이전 페이지로
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }

      // 컴포넌트 레벨 기본 UI
      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 m-2">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">컴포넌트 오류</h3>
              <p className="mt-1 text-sm text-red-700">{userMessage}</p>
              <div className="mt-3">
                <button
                  onClick={this.resetError}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

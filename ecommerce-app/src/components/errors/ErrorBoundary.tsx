import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';

type FallbackRender = (error: Error | null, reset: () => void) => ReactNode;

interface Props {
  children: ReactNode;
  fallback?: ReactNode | FallbackRender;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // 여기에서 에러 로깅 서비스로 전송할 수 있음
    // logErrorToService(error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.resetError);
      }
      if (fallback) {
        return fallback;
      }

      return (
        <div className="error-boundary-container">
          <ErrorMessage
            error={this.state.error || '오류가 발생했습니다'}
            variant="banner"
            showRetry={true}
            onRetry={this.resetError}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

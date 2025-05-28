import '../styles/globals.css';
import '../styles/error-styles.css';
import type { AppProps } from 'next/app';
import ErrorBoundary from '../components/errors/ErrorBoundary';
import { GlobalErrorHandler } from '../components/errors/GlobalErrorHandler';
import { ToastNotification } from '../components/errors/ToastNotification';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <GlobalErrorHandler />
      <Component {...pageProps} />
      <ToastNotification />
    </ErrorBoundary>
  );
}

export default MyApp;
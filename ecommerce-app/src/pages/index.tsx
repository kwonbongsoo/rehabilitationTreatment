import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ApiProvider } from '../context/RepositoryContext';
import ErrorBoundary from '../components/errors/ErrorBoundary';
import { GlobalErrorHandler } from '../components/errors/GlobalErrorHandler';
import { ToastNotification } from '../components/errors/ToastNotification';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ApiProvider>
            <ErrorBoundary>
                <GlobalErrorHandler />
                <Component {...pageProps} />
                <ToastNotification />
            </ErrorBoundary>
        </ApiProvider>
    );
}

export default MyApp;
import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiError } from '../api/types';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

export function useApi<T, Args extends any[] = any[]>(
    apiFunction: (...args: Args) => Promise<T>,
    options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: ApiError) => void;
    }
) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const isMounted = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const { onSuccess, onError } = options || {};

    const execute = useCallback(
        async (...args: Args) => {
            try {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                abortControllerRef.current = new AbortController();

                if (isMounted.current) {
                    setState({ data: null, loading: true, error: null });
                }

                const response = await apiFunction(...args);

                if (isMounted.current) {
                    setState({ data: response, loading: false, error: null });
                    onSuccess?.(response);
                }

                return response;
            } catch (e) {
                if ((e as Error).name === 'AbortError') return;

                const error = e as ApiError;
                if (isMounted.current) {
                    setState({ data: null, loading: false, error });
                    onError?.(error);
                }
                throw error;
            }
        },
        [apiFunction, onSuccess, onError]
    );

    return {
        ...state,
        execute,
        reset: useCallback(() => {
            if (isMounted.current) {
                setState({ data: null, loading: false, error: null });
            }
        }, [])
    };
}
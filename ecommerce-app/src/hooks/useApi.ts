import { useState, useCallback } from 'react';
import { ApiError } from '../api/types';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

interface UseApiOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: ApiError) => void;
}

export function useApi<T>(apiFunction: (...args: any[]) => Promise<T>, options?: UseApiOptions) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const execute = useCallback(
        async (...args: any[]) => {
            try {
                setState({ data: null, loading: true, error: null });

                const response = await apiFunction(...args);

                setState({ data: response, loading: false, error: null });
                options?.onSuccess?.(response);

                return response;
            } catch (e) {
                const error = e as ApiError;
                setState({ data: null, loading: false, error });
                options?.onError?.(error);

                throw error;
            }
        },
        [apiFunction, options]
    );

    return {
        ...state,
        execute,
        reset: useCallback(() => {
            setState({ data: null, loading: false, error: null });
        }, [])
    };
}
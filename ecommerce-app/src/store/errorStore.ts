import { create } from 'zustand';
import { ApiError, BaseError } from '../api/types';

interface ToastError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: number;
}

interface ErrorState {
    globalError: Error | ApiError | BaseError | null;
    toastErrors: ToastError[];
    setGlobalError: (error: Error | ApiError | BaseError | null) => void;
    clearGlobalError: () => void;
    addToastError: (message: string, type?: 'error' | 'warning' | 'info') => void;
    removeToastError: (id: string) => void;
    clearAllToastErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
    globalError: null,
    toastErrors: [],

    setGlobalError: (error) =>
        set({ globalError: error }),

    clearGlobalError: () =>
        set({ globalError: null }),

    addToastError: (message, type = 'error') =>
        set((state) => ({
            toastErrors: [
                ...state.toastErrors,
                {
                    id: Date.now().toString(),
                    message,
                    type,
                    timestamp: Date.now()
                }
            ]
        })),

    removeToastError: (id) =>
        set((state) => ({
            toastErrors: state.toastErrors.filter(error => error.id !== id)
        })),

    clearAllToastErrors: () =>
        set({ toastErrors: [] })
}));
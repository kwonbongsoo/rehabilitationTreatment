import React, { useEffect } from 'react';
import { useErrorStore } from '../../store/errorStore';

interface ToastNotificationProps {
    autoHideDuration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    autoHideDuration = 5000
}) => {
    const { toastErrors, removeToastError } = useErrorStore();

    useEffect(() => {
        // 자동으로 토스트 메시지 제거
        toastErrors.forEach(toast => {
            const timer = setTimeout(() => {
                removeToastError(toast.id);
            }, autoHideDuration);

            return () => clearTimeout(timer);
        });
    }, [toastErrors, removeToastError, autoHideDuration]);

    if (toastErrors.length === 0) return null;

    return (
        <div className="toast-container">
            {toastErrors.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    role="alert"
                >
                    <div className="toast-message">{toast.message}</div>
                    <button
                        className="toast-close"
                        onClick={() => removeToastError(toast.id)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};
import { useEffect } from 'react';
import { useToastError } from '../../store/useErrorStore';

interface ToastNotificationProps {
  autoHideDuration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  autoHideDuration = 5000,
}) => {
  const { toastErrors, removeToastError } = useToastError();

  useEffect(() => {
    const timers = toastErrors.map((toast) =>
      setTimeout(() => removeToastError(toast.id), autoHideDuration),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toastErrors, removeToastError, autoHideDuration]);

  if (toastErrors.length === 0) return null;

  return (
    <div className="toast-container">
      {toastErrors.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => removeToastError(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

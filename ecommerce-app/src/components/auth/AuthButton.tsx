import { ButtonHTMLAttributes } from 'react';
import styles from '@/styles/auth/Form.module.css';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary';
}

export default function AuthButton({
    children,
    isLoading = false,
    loadingText = '로딩 중...',
    variant = 'primary',
    ...props
}: AuthButtonProps) {
    const buttonClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;

    return (
        <button
            className={`${styles.button} ${buttonClass}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? loadingText : children}
        </button>
    );
}
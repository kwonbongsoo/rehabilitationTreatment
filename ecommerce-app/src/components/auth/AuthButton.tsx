import { ButtonHTMLAttributes, useEffect, useState } from 'react';
import styles from '@/styles/auth/Form.module.css';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary';
    cooldownMs?: number; // 버튼 쿨다운 시간 (밀리초)
}

export default function AuthButton({
    children,
    isLoading = false,
    loadingText = '로딩 중...',
    variant = 'primary',
    cooldownMs = 2000, // 기본 2초 쿨다운
    onClick,
    ...props
}: AuthButtonProps) {
    const [isInCooldown, setIsInCooldown] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const buttonClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
    const isDisabled = isLoading || props.disabled || isInCooldown;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) {
            event.preventDefault();
            return;
        }

        // 쿨다운 시작
        if (cooldownMs > 0) {
            setIsInCooldown(true);
            setCooldownRemaining(cooldownMs);
        }

        onClick?.(event);
    };

    // 쿨다운 타이머 효과
    useEffect(() => {
        if (!isInCooldown) return;

        const interval = setInterval(() => {
            setCooldownRemaining(prev => {
                if (prev <= 100) {
                    setIsInCooldown(false);
                    return 0;
                }
                return prev - 100;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isInCooldown]);

    // 로딩이 완료되면 쿨다운도 종료
    useEffect(() => {
        if (!isLoading && isInCooldown) {
            // 로딩 완료 후 최소 1초 쿨다운 유지
            const timeout = setTimeout(() => {
                setIsInCooldown(false);
                setCooldownRemaining(0);
            }, Math.max(1000, cooldownRemaining));

            return () => clearTimeout(timeout);
        }
    }, [isLoading, isInCooldown, cooldownRemaining]);

    const getButtonText = () => {
        if (isLoading) return loadingText;
        if (isInCooldown && cooldownRemaining > 0) {
            const seconds = Math.ceil(cooldownRemaining / 1000);
            return `${children} (${seconds}초 후 재시도)`;
        }
        return children;
    };

    return (
        <button
            className={`${styles.button} ${buttonClass} ${isDisabled ? styles.buttonDisabled : ''}`}
            disabled={isDisabled}
            onClick={handleClick}
            aria-busy={isLoading}
            {...props}
        >
            {getButtonText()}
        </button>
    );
}
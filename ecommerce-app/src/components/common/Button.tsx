/**
 * 공통 버튼 컴포넌트
 *
 * 프로젝트 전반에서 사용되는 버튼을 단순화하여 관리
 * - 4가지 variant 지원 (primary, secondary, outline, danger)
 * - 로딩, 비활성화 상태 지원
 * - 아이콘 버튼 지원
 * - 접근성 지원
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

/**
 * 버튼 변형 타입 (단순화)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

/**
 * 버튼 크기 타입
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * 버튼 속성 인터페이스
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

/**
 * 공통 버튼 컴포넌트
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loadingText = '로딩 중...',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    isDisabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <span className={styles.spinner} />
          {loadingText}
        </>
      );
    }

    const content = (
      <>
        {icon && iconPosition === 'left' && <span className={styles.iconLeft}>{icon}</span>}
        <span className={styles.content}>{children}</span>
        {icon && iconPosition === 'right' && <span className={styles.iconRight}>{icon}</span>}
      </>
    );

    return content;
  };

  return (
    <button className={buttonClasses} disabled={isDisabled} aria-busy={isLoading} {...props}>
      {renderContent()}
    </button>
  );
}

/**
 * 아이콘 버튼 컴포넌트
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export function IconButton({
  icon,
  size = 'medium',
  variant = 'outline',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={`${styles.iconButton} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}

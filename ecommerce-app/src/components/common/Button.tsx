/**
 * 공통 버튼 컴포넌트
 *
 * 프로젝트 전반에서 사용되는 다양한 버튼 스타일과 상태를 통합 관리
 * - 다양한 variant 지원 (primary, secondary, outline, ghost 등)
 * - 로딩, 비활성화 상태 지원
 * - 아이콘 버튼 지원
 * - 접근성 지원
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

/**
 * 버튼 변형 타입
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning';

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
  rounded?: boolean;
  gradient?: boolean;
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
  rounded = false,
  gradient = false,
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
    rounded && styles.rounded,
    gradient && styles.gradient,
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
  variant = 'ghost',
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

/**
 * 버튼 그룹 컴포넌트
 */
export interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'small' | 'medium' | 'large';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'medium',
  className = '',
}: ButtonGroupProps) {
  const groupClasses = [
    styles.buttonGroup,
    styles[`orientation-${orientation}`],
    styles[`spacing-${spacing}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={groupClasses}>{children}</div>;
}

/**
 * 플로팅 액션 버튼 컴포넌트
 */
export interface FloatingActionButtonProps
  extends Omit<ButtonProps, 'children' | 'variant' | 'size'> {
  icon: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  'aria-label': string;
}

export function FloatingActionButton({
  icon,
  position = 'bottom-right',
  className = '',
  ...props
}: FloatingActionButtonProps) {
  return (
    <Button
      variant="primary"
      size="large"
      rounded
      className={`${styles.fab} ${styles[`fab-${position}`]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}

/**
 * 토글 버튼 컴포넌트
 */
export interface ToggleButtonProps extends Omit<ButtonProps, 'variant' | 'onClick'> {
  isPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ToggleButton({
  isPressed = false,
  onPressedChange,
  onClick,
  className = '',
  children,
  ...props
}: ToggleButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPressedChange?.(!isPressed);
    onClick?.(event);
  };

  return (
    <Button
      variant={isPressed ? 'primary' : 'outline'}
      className={`${styles.toggleButton} ${isPressed ? styles.pressed : ''} ${className}`}
      onClick={handleClick}
      aria-pressed={isPressed}
      {...props}
    >
      {children}
    </Button>
  );
}

import { AnchorHTMLAttributes } from 'react';

export interface LinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href' | 'children'> {
  href: string;
  target?: string;
  rel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  gradient?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function LinkButton({
  href,
  target,
  rel = target === '_blank' ? 'noopener noreferrer' : undefined,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loadingText = '로딩 중...',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  gradient = false,
  disabled,
  className = '',
  children,
  onClick,
}: LinkButtonProps) {
  const linkClasses = [
    styles.button,
    styles.linkButton,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    rounded && styles.rounded,
    gradient && styles.gradient,
    isLoading && styles.loading,
    disabled && styles.disabled,
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

    return (
      <>
        {icon && iconPosition === 'left' && <span className={styles.iconLeft}>{icon}</span>}
        <span className={styles.content}>{children}</span>
        {icon && iconPosition === 'right' && <span className={styles.iconRight}>{icon}</span>}
      </>
    );
  };

  if (disabled || isLoading) {
    return (
      <span className={linkClasses} aria-disabled="true">
        {renderContent()}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={linkClasses}
      onClick={onClick}
      role="button"
    >
      {renderContent()}
    </a>
  );
}

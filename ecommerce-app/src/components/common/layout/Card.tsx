/**
 * 카드 컴포넌트 - 기본 카드 레이아웃
 */

import React, { ReactElement, ReactNode, HTMLAttributes } from 'react';
import styles from './Layout.module.css';

/**
 * 카드 컴포넌트 - 기본 카드 레이아웃
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  rounded = true,
  hoverable = false,
  className = '',
  ...props
}: CardProps): ReactElement {
  const cardClasses = [
    styles.card,
    styles[`card-${variant}`],
    styles[`padding-${padding}`],
    rounded && styles.rounded,
    hoverable && styles.hoverable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}

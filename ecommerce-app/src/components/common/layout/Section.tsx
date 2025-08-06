/**
 * 섹션 컴포넌트 - 페이지 섹션 레이아웃
 */

import React, { ReactNode, HTMLAttributes } from 'react';
import styles from './Layout.module.css';

/**
 * 섹션 컴포넌트 - 페이지 섹션 레이아웃
 */
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'section' | 'div' | 'article' | 'aside';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'muted' | 'accent';
  fullWidth?: boolean;
}

export function Section({
  children,
  as: Component = 'section',
  spacing = 'lg',
  background = 'none',
  fullWidth = false,
  className = '',
  ...props
}: SectionProps) {
  const sectionClasses = [
    styles.section,
    styles[`spacing-${spacing}`],
    styles[`background-${background}`],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={sectionClasses} {...props}>
      {children}
    </Component>
  );
}
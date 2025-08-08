/**
 * 컨테이너 컴포넌트 - 최대 너비와 중앙 정렬을 관리
 */

import React, { ReactElement, ReactNode, HTMLAttributes } from 'react';
import styles from './Layout.module.css';

/**
 * 컨테이너 속성 인터페이스
 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
  fluid?: boolean;
}

/**
 * 컨테이너 컴포넌트 - 최대 너비와 중앙 정렬을 관리
 */
export function Container({
  children,
  maxWidth = 'lg',
  padding = 'md',
  centered = true,
  fluid = false,
  className = '',
  ...props
}: ContainerProps): ReactElement {
  const containerClasses = [
    styles.container,
    !fluid && styles[`maxWidth-${maxWidth}`],
    styles[`padding-${padding}`],
    centered && styles.centered,
    fluid && styles.fluid,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
}

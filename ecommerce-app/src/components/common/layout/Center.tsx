/**
 * 센터 컴포넌트 - 중앙 정렬 레이아웃
 */

import React, { ReactNode, HTMLAttributes, CSSProperties } from 'react';
import styles from './Layout.module.css';

/**
 * 센터 컴포넌트 - 중앙 정렬 레이아웃
 */
export interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  axis?: 'both' | 'horizontal' | 'vertical';
  minHeight?: string;
}

export function Center({
  children,
  axis = 'both',
  minHeight = '100%',
  className = '',
  style,
  ...props
}: CenterProps) {
  const centerClasses = [styles.center, styles[`center-${axis}`], className]
    .filter(Boolean)
    .join(' ');

  const centerStyle: CSSProperties = {
    ...style,
    minHeight,
  };

  return (
    <div className={centerClasses} style={centerStyle} {...props}>
      {children}
    </div>
  );
}
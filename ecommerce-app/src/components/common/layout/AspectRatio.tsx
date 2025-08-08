/**
 * 아스펙트 비율 컴포넌트
 */

import React, { ReactElement, ReactNode, HTMLAttributes, CSSProperties } from 'react';
import styles from './Layout.module.css';

/**
 * 아스펙트 비율 컴포넌트
 */
export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ratio?: number | string;
  maxWidth?: string;
}

export function AspectRatio({
  children,
  ratio = 16 / 9,
  maxWidth,
  className = '',
  style,
  ...props
}: AspectRatioProps): ReactElement {
  const aspectRatioStyle: CSSProperties = {
    ...style,
    aspectRatio: typeof ratio === 'number' ? ratio.toString() : ratio,
    maxWidth,
  };

  return (
    <div className={`${styles.aspectRatio} ${className}`} style={aspectRatioStyle} {...props}>
      {children}
    </div>
  );
}

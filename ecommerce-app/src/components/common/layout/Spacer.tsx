/**
 * 스페이서 컴포넌트 - 공간 생성
 */

import React, { CSSProperties } from 'react';
import styles from './Layout.module.css';

/**
 * 스페이서 컴포넌트 - 공간 생성
 */
export interface SpacerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  axis?: 'horizontal' | 'vertical' | 'both';
}

export function Spacer({ size = 'md', axis = 'vertical' }: SpacerProps) {
  const spacerClasses = [
    styles.spacer,
    typeof size === 'string' && !['sm', 'md', 'lg', 'xl'].includes(size)
      ? undefined
      : styles[`spacer-${size}`],
    styles[`spacer-${axis}`],
  ]
    .filter(Boolean)
    .join(' ');

  const customSize = typeof size === 'string' && !['sm', 'md', 'lg', 'xl'].includes(size);
  const spacerStyle: CSSProperties = {};

  if (customSize) {
    if (axis === 'horizontal') {
      spacerStyle.width = size;
    } else if (axis === 'vertical') {
      spacerStyle.height = size;
    } else if (axis === 'both') {
      spacerStyle.width = size;
      spacerStyle.height = size;
    }
  }

  return <div className={spacerClasses} style={spacerStyle} />;
}
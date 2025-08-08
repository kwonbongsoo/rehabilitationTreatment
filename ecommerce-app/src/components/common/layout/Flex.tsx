/**
 * 플렉스 컴포넌트 - Flexbox 레이아웃
 */

import React, { ReactElement, ReactNode, HTMLAttributes } from 'react';
import styles from './Layout.module.css';

/**
 * 플렉스 속성 인터페이스
 */
export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  inline?: boolean;
}

/**
 * 플렉스 컴포넌트 - Flexbox 레이아웃
 */
export function Flex({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap = 'md',
  inline = false,
  className = '',
  ...props
}: FlexProps): ReactElement {
  const flexClasses = [
    inline ? styles.inlineFlex : styles.flex,
    styles[`direction-${direction}`],
    styles[`wrap-${wrap}`],
    styles[`justify-${justify}`],
    styles[`align-${align}`],
    styles[`gap-${gap}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
}

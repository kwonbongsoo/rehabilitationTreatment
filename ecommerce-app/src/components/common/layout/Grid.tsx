/**
 * 그리드 컴포넌트 - CSS Grid 레이아웃
 */

import React, { ReactElement, ReactNode, HTMLAttributes, CSSProperties } from 'react';
import styles from './Layout.module.css';

/**
 * 그리드 속성 인터페이스
 */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: number | 'auto-fit' | 'auto-fill';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  minItemWidth?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * 그리드 컴포넌트 - CSS Grid 레이아웃
 */
export function Grid({
  children,
  columns = 'auto-fit',
  gap = 'md',
  minItemWidth = '250px',
  alignItems = 'stretch',
  justifyItems = 'stretch',
  responsive,
  className = '',
  style,
  ...props
}: GridProps): ReactElement {
  const gridClasses = [
    styles.grid,
    styles[`gap-${gap}`],
    styles[`alignItems-${alignItems}`],
    styles[`justifyItems-${justifyItems}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const gridStyle: CSSProperties & Record<string, any> = {
    ...style,
    '--grid-columns': typeof columns === 'number' ? columns : undefined,
    '--grid-min-item-width': minItemWidth,
    gridTemplateColumns:
      typeof columns === 'number'
        ? `repeat(${columns}, 1fr)`
        : `repeat(${columns}, minmax(${minItemWidth}, 1fr))`,
  };

  // 반응형 그리드 스타일 추가
  if (responsive) {
    Object.entries(responsive).forEach(([breakpoint, cols]) => {
      gridStyle[`--grid-${breakpoint}`] = cols;
    });
  }

  return (
    <div className={gridClasses} style={gridStyle} {...props}>
      {children}
    </div>
  );
}

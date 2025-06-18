/**
 * 공통 레이아웃 컴포넌트들
 *
 * 프로젝트 전반에서 사용되는 레이아웃 패턴들을 표준화
 * - 컨테이너, 그리드, 플렉스 레이아웃
 * - 반응형 디자인 지원
 * - 간격 및 정렬 옵션
 * - 접근성 지원
 */

import React, { ReactNode, HTMLAttributes, CSSProperties } from 'react';
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
}: ContainerProps) {
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
}: GridProps) {
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
}: FlexProps) {
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

/**
 * 스택 컴포넌트 - 수직 또는 수평 스택 레이아웃
 */
export interface StackProps extends Omit<FlexProps, 'direction'> {
  direction?: 'vertical' | 'horizontal';
  divider?: ReactNode;
}

export function Stack({
  children,
  direction = 'vertical',
  divider,
  gap = 'md',
  className = '',
  ...props
}: StackProps) {
  const flexDirection = direction === 'vertical' ? 'column' : 'row';

  if (divider) {
    const childrenArray = React.Children.toArray(children);
    const childrenWithDividers = childrenArray.reduce<ReactNode[]>((acc, child, index) => {
      acc.push(child);
      if (index < childrenArray.length - 1) {
        acc.push(
          <div key={`divider-${index}`} className={styles.divider}>
            {divider}
          </div>,
        );
      }
      return acc;
    }, []);

    return (
      <Flex
        direction={flexDirection}
        gap="none"
        className={`${styles.stack} ${className}`}
        {...props}
      >
        {childrenWithDividers}
      </Flex>
    );
  }

  return (
    <Flex direction={flexDirection} gap={gap} className={`${styles.stack} ${className}`} {...props}>
      {children}
    </Flex>
  );
}

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
}: AspectRatioProps) {
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
}: CardProps) {
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

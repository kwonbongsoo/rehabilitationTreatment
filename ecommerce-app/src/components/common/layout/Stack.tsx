/**
 * 스택 컴포넌트 - 수직 또는 수평 스택 레이아웃
 */

import React, { ReactNode } from 'react';
import styles from './Layout.module.css';
import { Flex, FlexProps } from './Flex';

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
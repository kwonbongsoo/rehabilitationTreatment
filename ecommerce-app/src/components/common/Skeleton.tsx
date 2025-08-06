import styles from './Skeleton.module.css';
import { ReactElement } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string | undefined;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps): ReactElement {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  const classNames = [styles.skeleton, styles[variant], styles[animation], className]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames} style={style} />;
}

// 텍스트 스켈레톤 헬퍼 컴포넌트
export function TextSkeleton({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string | undefined;
}): ReactElement {
  return (
    <div className={className}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height="16px"
          width={index === lines - 1 ? '60%' : '100%'}
          className={index > 0 ? styles.textLineSpacing : ''}
        />
      ))}
    </div>
  );
}

// 이미지 스켈레톤 헬퍼 컴포넌트
export function ImageSkeleton({
  width = '100%',
  height = '200px',
  className,
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}): ReactElement {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      borderRadius="8px"
      className={className}
    />
  );
}

// 원형 아바타 스켈레톤
export function AvatarSkeleton({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}): ReactElement {
  return <Skeleton variant="circular" width={size} height={size} className={className} />;
}

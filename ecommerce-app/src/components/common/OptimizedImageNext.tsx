'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface OptimizedImageNextProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string | undefined;
  priority?: boolean;
  fallbackSrc?: string;
  lazy?: boolean;
  style?: React.CSSProperties;
}

export default function OptimizedImageNext({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fallbackSrc = 'https://www.kbs-cdn.shop/image/placeholder.webp',
  lazy = false,
  style = { objectFit: 'cover' },
}: OptimizedImageNextProps): React.ReactElement {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // src가 변경될 때 imgSrc 업데이트 (hydration 안전성)
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
      loading={priority ? 'eager' : lazy ? 'lazy' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={handleError}
      sizes="(max-width: 768px) 50vw, 200px"
    />
  );
}

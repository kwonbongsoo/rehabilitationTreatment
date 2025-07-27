'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  lazy?: boolean;
}

export default function OptimizedImage({
  src,
  fallbackSrc = 'https://www.kbs-cdn.shop/image/placeholder.webp',
  lazy = true,
  priority,
  loading,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  // priority가 true이면 eager 로딩, 그렇지 않으면 lazy 옵션에 따라 결정
  const shouldLazyLoad = !priority && lazy;
  const loadingStrategy = loading || (shouldLazyLoad ? 'lazy' : 'eager');

  return (
    <Image
      src={imgSrc}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
      placeholder="blur"
      blurDataURL="https://www.kbs-cdn.shop/image/placeholder.webp"
      quality={75}
      loading={loadingStrategy}
      priority={priority || false}
      {...props}
      alt={props.alt}
    />
  );
}

'use client';

import { useState, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  lazy?: boolean;
  priority?: boolean;
}

function buildCdnUrl(src: string, width?: number, height?: number): string {
  const cdnDomain =
    process.env.NEXT_PUBLIC_CDN_DOMAIN || 'https://image-resizer.star1231076.workers.dev';
  if (!cdnDomain) return src;

  const params = new URLSearchParams();
  params.set('url', src);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('fit', 'cover');
  params.set('f', 'webp');

  return `${cdnDomain}/?${params.toString()}`;
}

export default function OptimizedImage({
  src,
  fallbackSrc = 'https://www.kbs-cdn.shop/image/placeholder.webp',
  lazy = false,
  priority = false,
  width,
  height,
  loading,
  ...props
}: OptimizedImageProps) {
  const optimizedSrc = buildCdnUrl(src, width ? Number(width) : 500, height ? Number(height) : 500);
  const optimizedFallbackSrc = buildCdnUrl(
    fallbackSrc,
    Number(width) ?? 500,
    Number(height) ?? 500,
  );
  const [imgSrc, setImgSrc] = useState(optimizedSrc);

  const loadingStrategy = loading || (priority ? 'eager' : lazy ? 'lazy' : 'eager');

  return (
    <img
      src={imgSrc}
      width={width}
      height={height}
      onError={() => {
        if (imgSrc !== optimizedFallbackSrc) setImgSrc(optimizedFallbackSrc);
      }}
      loading={loadingStrategy}
      {...props}
      alt={props.alt}
    />
  );
}

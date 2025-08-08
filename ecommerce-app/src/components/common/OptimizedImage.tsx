'use client';

import { useState, ImgHTMLAttributes, ReactElement } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  lazy?: boolean;
  priority?: boolean;
}

function buildCdnUrl(src: string, width?: number, height?: number, format?: string): string {
  const cdnDomain =
    process.env.NEXT_PUBLIC_CDN_DOMAIN || 'https://image-resizer.star1231076.workers.dev';
  if (!cdnDomain) return src;

  const params = new URLSearchParams();
  params.set('url', src);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('fit', 'cover');
  if (format) params.set('f', format);

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
}: OptimizedImageProps): ReactElement {
  const w = width ? Number(width) : 500;
  const h = height ? Number(height) : 500;
  
  // Build URLs for different formats
  const avifSrc = buildCdnUrl(src, w, h, 'avif');
  const webpSrc = buildCdnUrl(src, w, h, 'webp');
  const jpgSrc = buildCdnUrl(src, w, h, 'jpeg');
  
  const optimizedFallbackSrc = buildCdnUrl(fallbackSrc, w, h, 'webp');
  const [hasError, setHasError] = useState(false);

  const loadingStrategy = loading || (priority ? 'eager' : lazy ? 'lazy' : 'eager');

  const handleError = (): void => {
    if (!hasError) {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <img
        src={optimizedFallbackSrc}
        width={width}
        height={height}
        loading={loadingStrategy}
        {...props}
        alt={props.alt}
      />
    );
  }

  return (
    <picture>
      <source srcSet={avifSrc} type="image/avif" />
      <source srcSet={webpSrc} type="image/webp" />
      <img 
        src={jpgSrc}
        width={width}
        height={height}
        onError={handleError}
        loading={loadingStrategy}
        {...props}
        alt={props.alt}
      />
    </picture>
  );
}

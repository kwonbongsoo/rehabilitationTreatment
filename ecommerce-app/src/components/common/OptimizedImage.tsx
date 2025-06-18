import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  fallbackSrc = '/images/placeholder.webp',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
      placeholder="blur"
      blurDataURL="/images/placeholder.webp"
      quality={75}
      loading="lazy"
      {...props}
      alt={props.alt}
    />
  );
}

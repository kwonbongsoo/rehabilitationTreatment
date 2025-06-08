import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    fallbackSrc?: string;
}

export default function OptimizedImage({ src, fallbackSrc = '/public/images/placeholder.webp', ...props }: OptimizedImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <Image
            src={imgSrc}
            onError={() => setImgSrc(fallbackSrc)}
            placeholder="blur"
            blurDataURL="/placeholder.png"
            quality={75}
            loading="lazy"
            {...props}
            alt={props.alt}
        />
    );
}

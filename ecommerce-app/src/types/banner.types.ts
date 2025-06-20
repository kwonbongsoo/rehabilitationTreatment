// Banner 컴포넌트 관련 타입 정의
export interface Slide {
  id: number;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  link: string;
  buttonText?: string;
}

export interface BannerProps {
  slides: Slide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  height?: {
    mobile: number;
    tablet: number;
    desktop: number;
    largeDesktop: number;
  };
  imageSizes?: string;
  className?: string;
}

export interface BannerConfig {
  autoPlay: boolean;
  autoPlayInterval: number;
  showDots: boolean;
  showArrows: boolean;
  imageSizes: string;
}

// 기본 설정값
export const DEFAULT_BANNER_CONFIG: BannerConfig = {
  autoPlay: true,
  autoPlayInterval: 5000,
  showDots: true,
  showArrows: false,
  imageSizes:
    '(max-width: 360px) 100vw, (max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px',
};

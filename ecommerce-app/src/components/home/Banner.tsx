'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import styles from '@/styles/home/Banner.module.css';
import { BannerProps, DEFAULT_BANNER_CONFIG } from '@/types/banner.types';

export default function Banner({
  slides,
  autoPlay = DEFAULT_BANNER_CONFIG.autoPlay,
  autoPlayInterval = DEFAULT_BANNER_CONFIG.autoPlayInterval,
  showDots = DEFAULT_BANNER_CONFIG.showDots,
  showArrows: _showArrows = DEFAULT_BANNER_CONFIG.showArrows,
  imageSizes: _imageSizes = DEFAULT_BANNER_CONFIG.imageSizes,
  className = '',
}: BannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이더 자동 재생
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [slides.length, autoPlay, autoPlayInterval]);

  // 슬라이더 네비게이션 함수들을 useCallback으로 메모이제이션
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // const goToPrevSlide = useCallback(() => {
  //   setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  // }, [slides.length]);

  // const goToNextSlide = useCallback(() => {
  //   setCurrentSlide((prev) => (prev + 1) % slides.length);
  // }, [slides.length]);

  if (slides.length === 0) return null;
  return (
    <section className={`${styles.sliderSection} ${className}`}>
      <div className={styles.slider}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === currentSlide ? styles.activeSlide : ''}`}
          >
            <Link href={slide.link} className={styles.slideLink}>
              <div className={styles.slideContent}>
                <div className={styles.textContent}>
                  <h3 className={styles.slideTitle}>New collection</h3>
                  <p className={styles.slideSubtitle}>Discount 50% for the first transaction</p>
                  <button className={styles.shopButton}>Shop now</button>
                </div>
                <div className={styles.imageContainer}>
                  <OptimizedImage
                    src={slide.src}
                    alt={slide.alt}
                    width={120}
                    height={160}
                    priority={index === 0}
                    className={styles.sliderImage}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* 도트 네비게이션 */}
        {showDots && slides.length > 1 && (
          <div className={styles.sliderDots}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

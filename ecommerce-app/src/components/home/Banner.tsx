import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import styles from '@/styles/home/Banner.module.css';
import { Slide, BannerProps, DEFAULT_BANNER_CONFIG } from '@/types/banner.types';

export default function Banner({
    slides,
    autoPlay = DEFAULT_BANNER_CONFIG.autoPlay,
    autoPlayInterval = DEFAULT_BANNER_CONFIG.autoPlayInterval,
    showDots = DEFAULT_BANNER_CONFIG.showDots,
    showArrows = DEFAULT_BANNER_CONFIG.showArrows,
    imageSizes = DEFAULT_BANNER_CONFIG.imageSizes,
    className = ""
}: BannerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // 슬라이더 자동 재생
    useEffect(() => {
        if (!autoPlay || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, autoPlayInterval);
        return () => clearInterval(interval);
    }, [slides.length, autoPlay, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrevSlide = () => {
        setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1);
    };

    const goToNextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
    };

    if (slides.length === 0) return null; return (
        <section className={`${styles.sliderSection} ${className}`}>
            <div className={styles.slider}>
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`${styles.slide} ${index === currentSlide ? styles.activeSlide : ''}`}
                    >
                        <div className={styles.imageContainer}>
                            <OptimizedImage
                                src={slide.src}
                                alt={slide.alt}
                                fill
                                priority={index === 0} // 첫 번째 슬라이드만 우선순위
                                className={styles.sliderImage}
                                sizes={imageSizes}
                            />
                        </div>
                        <div className={styles.slideContent}>
                            <h2>{slide.title || slide.alt}</h2>
                            {slide.description && (
                                <p className={styles.slideDescription}>{slide.description}</p>
                            )}
                            <Link href={slide.link} className={styles.sliderButton}>
                                {slide.buttonText || "자세히 보기"}
                            </Link>
                        </div>
                    </div>
                ))}

                {/* 화살표 네비게이션 */}
                {showArrows && slides.length > 1 && (
                    <>
                        <button
                            className={`${styles.arrowButton} ${styles.prevButton}`}
                            onClick={goToPrevSlide}
                            aria-label="이전 슬라이드"
                        >
                            &#8249;
                        </button>
                        <button
                            className={`${styles.arrowButton} ${styles.nextButton}`}
                            onClick={goToNextSlide}
                            aria-label="다음 슬라이드"
                        >
                            &#8250;
                        </button>
                    </>
                )}

                {/* 도트 네비게이션 */}
                {showDots && slides.length > 1 && (
                    <div className={styles.sliderDots}>
                        {slides.map((slide, index) => (
                            <button
                                key={index}
                                className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`${slide.title || slide.alt} 슬라이드로 이동`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
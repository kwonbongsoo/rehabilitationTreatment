'use client';

import { useState, useEffect, useCallback, useRef, ReactElement } from 'react';
import Link from 'next/link';
import OptimizedImageNext from '@/components/common/OptimizedImageNext';
import styles from '@/styles/home/Banner.module.css';
import { BannerProps, DEFAULT_BANNER_CONFIG } from '@/types/banner.types';
import React from 'react';

export default function Banner({
  slides,
  autoPlay = DEFAULT_BANNER_CONFIG.autoPlay,
  autoPlayInterval = DEFAULT_BANNER_CONFIG.autoPlayInterval,
  showDots: _showDots = DEFAULT_BANNER_CONFIG.showDots,
  showArrows: _showArrows = DEFAULT_BANNER_CONFIG.showArrows,
  imageSizes: _imageSizes = DEFAULT_BANNER_CONFIG.imageSizes,
  className = '',
}: BannerProps): ReactElement {
  void _showDots;
  void _showArrows;
  void _imageSizes;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

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
    setCurrentTranslate(-index * 100);
    setPrevTranslate(-index * 100);
  }, []);

  const goToNextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  }, [currentSlide, slides.length, goToSlide]);

  const goToPrevSlide = useCallback(() => {
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(prevIndex);
  }, [currentSlide, slides.length, goToSlide]);

  // 터치/마우스 이벤트 핸들러
  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      setHasDragged(false);
      setStartPos({ x: clientX, y: clientY });
      setPrevTranslate(currentTranslate);
    },
    [currentTranslate],
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const currentPosition = clientX;
      const diff = currentPosition - startPos.x;

      // 5px 이상 움직였을 때만 드래그로 인식
      if (Math.abs(diff) > 5) {
        setHasDragged(true);
      }

      const translate = prevTranslate + (diff * 100) / (sliderRef.current?.offsetWidth || 1);
      setCurrentTranslate(translate);
    },
    [isDragging, startPos.x, prevTranslate],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -20 && currentSlide < slides.length - 1) {
      goToNextSlide();
    } else if (movedBy > 20 && currentSlide > 0) {
      goToPrevSlide();
    } else {
      // 원래 위치로 되돌리기
      setCurrentTranslate(-currentSlide * 100);
      setPrevTranslate(-currentSlide * 100);
    }

    // 드래그 상태를 약간 지연시켜 클릭 이벤트와 충돌 방지
    setTimeout(() => {
      setHasDragged(false);
    }, 50);
  }, [
    isDragging,
    currentTranslate,
    prevTranslate,
    currentSlide,
    slides.length,
    goToNextSlide,
    goToPrevSlide,
  ]);

  // 마우스 이벤트
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 터치 이벤트
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleStart(touch.clientX, touch.clientY);
      }
    },
    [handleStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX);
      }
    },
    [handleMove],
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 링크 클릭 이벤트 처리
  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [hasDragged],
  );

  if (slides.length === 0) {
    return <></>;
  }

  return (
    <section className={`${styles.sliderSection} ${className}`}>
      <div
        ref={sliderRef}
        className={styles.slider}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${isDragging ? currentTranslate : -currentSlide * 100}%)`,
          transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {slides.map((slide, index) => {
          const slideBackground =
            slide.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${index === currentSlide ? styles.activeSlide : ''}`}
              style={
                {
                  '--slide-bg': slideBackground,
                } as React.CSSProperties
              }
            >
              <Link href={slide.link} className={styles.slideLink} onClick={handleLinkClick}>
                <div className={styles.slideContent}>
                  <div className={styles.textContent}>
                    <h2 className={styles.slideTitle}>{slide.title || 'New collection'}</h2>
                    <p className={styles.slideSubtitle}>
                      {slide.description || 'Discount 50% for the first transaction'}
                    </p>
                    <button className={styles.shopButton}>{slide.buttonText || 'Shop now'}</button>
                  </div>
                  <div className={styles.imageContainer}>
                    <OptimizedImageNext
                      src={slide.src}
                      alt={slide.alt}
                      width={120}
                      height={120}
                      priority={index === 0}
                      className={styles.sliderImage}
                    />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

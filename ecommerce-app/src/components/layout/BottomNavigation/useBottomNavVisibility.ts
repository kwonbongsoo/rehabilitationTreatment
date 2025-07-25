import { useState, useEffect, useRef, useCallback } from 'react';

interface UseBottomNavVisibilityOptions {
  hideThreshold?: number;
  showThreshold?: number;
  autoShowDelay?: number;
}

export const useBottomNavVisibility = ({
  hideThreshold = 200,
  showThreshold = 100,
  autoShowDelay = 2000,
}: UseBottomNavVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const sentinelUpRef = useRef<HTMLDivElement | null>(null);
  const sentinelDownRef = useRef<HTMLDivElement | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoShow = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, autoShowDelay);
  }, [autoShowDelay, clearHideTimeout]);

  const createSentinelElement = useCallback((top: number): HTMLDivElement => {
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = `${top}px`;
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    sentinel.style.pointerEvents = 'none';
    sentinel.style.opacity = '0';
    sentinel.style.zIndex = '-1';
    return sentinel;
  }, []);

  useEffect(() => {
    // 센티넬 요소들 생성
    const upSentinel = createSentinelElement(showThreshold);
    const downSentinel = createSentinelElement(hideThreshold);

    document.body.appendChild(upSentinel);
    document.body.appendChild(downSentinel);

    sentinelUpRef.current = upSentinel;
    sentinelDownRef.current = downSentinel;

    // Intersection Observer 콜백
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const isUpSentinel = entry.target === sentinelUpRef.current;
        const isDownSentinel = entry.target === sentinelDownRef.current;

        if (isUpSentinel && entry.isIntersecting) {
          // 상단 센티넬이 보이면 (스크롤 업) 네비게이션 표시
          setIsVisible(true);
          clearHideTimeout();
        } else if (isDownSentinel && !entry.isIntersecting && entry.boundingClientRect.top < 0) {
          // 하단 센티넬이 뷰포트 위로 사라지면 (스크롤 다운) 네비게이션 숨김
          setIsVisible(false);
          scheduleAutoShow();
        }
      });
    };

    // Observer 생성 및 시작
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0,
      rootMargin: '0px',
    });

    observer.observe(upSentinel);
    observer.observe(downSentinel);

    // 정리 함수
    return () => {
      observer.disconnect();
      clearHideTimeout();

      if (sentinelUpRef.current && document.body.contains(sentinelUpRef.current)) {
        document.body.removeChild(sentinelUpRef.current);
      }
      if (sentinelDownRef.current && document.body.contains(sentinelDownRef.current)) {
        document.body.removeChild(sentinelDownRef.current);
      }
    };
  }, [hideThreshold, showThreshold, createSentinelElement, clearHideTimeout, scheduleAutoShow]);

  // 수동으로 가시성 제어하는 함수들
  const show = useCallback(() => {
    setIsVisible(true);
    clearHideTimeout();
  }, [clearHideTimeout]);

  const hide = useCallback(() => {
    setIsVisible(false);
    scheduleAutoShow();
  }, [scheduleAutoShow]);

  return {
    isVisible,
    show,
    hide,
  };
};

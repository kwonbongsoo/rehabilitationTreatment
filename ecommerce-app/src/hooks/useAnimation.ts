/**
 * 애니메이션 관련 공통 훅
 *
 * 프로젝트 전반에서 사용되는 애니메이션 패턴을 표준화
 * - 페이드 인/아웃
 * - 슬라이드 애니메이션
 * - 카운트업 애니메이션
 * - 스크롤 기반 애니메이션
 * - 타이핑 효과
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * 페이드 인 애니메이션 훅
 */
export function useFadeIn(duration: number = 300, delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const fadeIn = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    }, delay);
  }, [duration, delay]);

  const fadeOut = useCallback(() => {
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  const reset = useCallback(() => {
    setIsVisible(false);
    setIsAnimating(false);
  }, []);

  const style = useMemo(
    () => ({
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${duration}ms ease-in-out`,
    }),
    [isVisible, duration],
  );

  return {
    isVisible,
    isAnimating,
    fadeIn,
    fadeOut,
    reset,
    style,
  };
}

/**
 * 슬라이드 애니메이션 훅
 */
export function useSlideAnimation(
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  duration: number = 300,
) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const slideIn = useCallback(() => {
    setIsAnimating(true);
    setIsVisible(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  const slideOut = useCallback(() => {
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  const getTransform = useCallback(() => {
    if (isVisible) return 'translate(0, 0)';

    switch (direction) {
      case 'left':
        return 'translateX(-100%)';
      case 'right':
        return 'translateX(100%)';
      case 'up':
        return 'translateY(-100%)';
      case 'down':
        return 'translateY(100%)';
      default:
        return 'translateX(-100%)';
    }
  }, [isVisible, direction]);

  const style = useMemo(
    () => ({
      transform: getTransform(),
      transition: `transform ${duration}ms ease-in-out`,
    }),
    [getTransform, duration],
  );

  return {
    isVisible,
    isAnimating,
    slideIn,
    slideOut,
    style,
  };
}

/**
 * 카운트업 애니메이션 훅
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0,
  decimals: number = 0,
) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setCount(start);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;

      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [start, end, duration, decimals]);

  const reset = useCallback(() => {
    setCount(start);
    setIsAnimating(false);
  }, [start]);

  return {
    count,
    isAnimating,
    startAnimation,
    reset,
  };
}

/**
 * 스크롤 기반 애니메이션 훅
 */
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  const style = useMemo(
    () => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    }),
    [isVisible],
  );

  return {
    elementRef,
    isVisible,
    style,
  };
}

/**
 * 타이핑 효과 훅
 */
export function useTypingEffect(
  text: string,
  speed: number = 100,
  deleteSpeed: number = 50,
  pauseDuration: number = 2000,
  loop: boolean = false,
) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startAnimation = useCallback(() => {
    setDisplayText('');
    setIsTyping(true);
    setIsDeleting(false);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!isTyping && !isDeleting) return;

    const currentSpeed = isDeleting ? deleteSpeed : speed;
    const timeout = setTimeout(() => {
      if (isTyping && !isDeleting) {
        // 타이핑 중
        if (displayText.length < text.length) {
          setDisplayText(text.slice(0, displayText.length + 1));
        } else {
          // 타이핑 완료
          setIsTyping(false);
          setIsComplete(true);

          if (loop) {
            // 루프인 경우 삭제 시작
            setTimeout(() => {
              setIsDeleting(true);
            }, pauseDuration);
          }
        }
      } else if (isDeleting) {
        // 삭제 중
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // 삭제 완료, 다시 타이핑 시작
          setIsDeleting(false);
          setIsTyping(true);
        }
      }
    }, currentSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, text, speed, deleteSpeed, pauseDuration, loop, isTyping, isDeleting]);

  const reset = useCallback(() => {
    setDisplayText('');
    setIsTyping(false);
    setIsDeleting(false);
    setIsComplete(false);
  }, []);

  return {
    displayText,
    isTyping,
    isDeleting,
    isComplete,
    startAnimation,
    reset,
  };
}

/**
 * 진동 애니메이션 훅
 */
export function useShakeAnimation(intensity: number = 10, duration: number = 500) {
  const [isShaking, setIsShaking] = useState(false);
  const [offset, setOffset] = useState(0);

  const shake = useCallback(() => {
    setIsShaking(true);

    const interval = setInterval(() => {
      setOffset((Math.random() - 0.5) * intensity);
    }, 50);

    const timeout = setTimeout(() => {
      setIsShaking(false);
      setOffset(0);
      clearInterval(interval);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [intensity, duration]);

  const stop = useCallback(() => {
    setIsShaking(false);
    setOffset(0);
  }, []);

  const style = useMemo(
    () => ({
      transform: isShaking ? `translateX(${offset}px)` : 'translateX(0)',
      transition: isShaking ? 'none' : 'transform 0.1s ease-out',
    }),
    [isShaking, offset],
  );

  return {
    isShaking,
    shake,
    stop,
    style,
  };
}

/**
 * 스케일 애니메이션 훅
 */
export function useScaleAnimation(
  targetScale: number = 1,
  duration: number = 300,
  easing: string = 'ease-out',
) {
  const [currentScale, setCurrentScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const scaleTo = useCallback(
    (scale: number) => {
      setIsAnimating(true);
      setCurrentScale(scale);
      setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    },
    [duration],
  );

  const scaleUp = useCallback(() => {
    scaleTo(targetScale);
  }, [scaleTo, targetScale]);

  const scaleDown = useCallback(() => {
    scaleTo(1);
  }, [scaleTo]);

  const style = useMemo(
    () => ({
      transform: `scale(${currentScale})`,
      transition: `transform ${duration}ms ${easing}`,
    }),
    [currentScale, duration, easing],
  );

  return {
    currentScale,
    isAnimating,
    scaleTo,
    scaleUp,
    scaleDown,
    style,
  };
}

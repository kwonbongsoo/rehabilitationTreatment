import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endDate: Date;
  title?: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  endDate,
  title = '세일 마감까지',
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  // 타이머 계산 로직을 useCallback으로 메모이제이션
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const distance = endDate.getTime() - now;

    if (distance < 0) {
      setIsExpired(true);
      onExpire?.();
      return null;
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  }, [endDate, onExpire]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (isExpired) {
    return (
      <div className={styles.expiredContainer}>
        <h3 className={styles.expiredTitle}>세일이 종료되었습니다</h3>
        <p className={styles.expiredMessage}>다음 기회를 기대해 주세요!</p>
      </div>
    );
  }

  return (
    <div className={styles.timerContainer}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.timer}>
        <div className={styles.timeUnit}>
          <div className={styles.timeValue}>{timeLeft.days}</div>
          <div className={styles.timeLabel}>일</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.timeUnit}>
          <div className={styles.timeValue}>{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className={styles.timeLabel}>시간</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.timeUnit}>
          <div className={styles.timeValue}>{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className={styles.timeLabel}>분</div>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.timeUnit}>
          <div className={styles.timeValue}>{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className={styles.timeLabel}>초</div>
        </div>
      </div>
    </div>
  );
}

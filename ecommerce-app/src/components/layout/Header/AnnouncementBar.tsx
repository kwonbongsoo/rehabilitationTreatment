import React, { memo } from 'react';
import styles from '@/styles/layout/Header/AnnouncementBar.module.css';

interface AnnouncementBarProps {
  message?: string;
  type?: 'info' | 'promotion' | 'warning';
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = memo(
  ({ message = '무료 배송 이벤트: 5만원 이상 구매 시', type = 'promotion' }) => {
    return (
      <div className={`${styles.announcementBar} ${styles[type]}`}>
        <p>{message}</p>
      </div>
    );
  },
);

AnnouncementBar.displayName = 'AnnouncementBar';

export default AnnouncementBar;

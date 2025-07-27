'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './CommonHeader.module.css';

interface CommonHeaderProps {
  title: string;
  showDeleteButton?: boolean;
  onDeleteClick?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ 
  title, 
  showDeleteButton = false, 
  onDeleteClick 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackClick = () => {
    router.back();
  };

  const isCartPage = pathname === '/cart';

  return (
    <div className={styles.header}>
      <button 
        className={styles.backButton} 
        onClick={handleBackClick} 
        aria-label="뒤로가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      <h1 className={styles.title}>{title}</h1>
      
      {isCartPage && showDeleteButton && (
        <button 
          className={styles.deleteAllButton} 
          onClick={onDeleteClick} 
          aria-label="전체 삭제"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" />
            <path
              d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}
      
      {!isCartPage && (
        <div className={styles.placeholder} />
      )}
    </div>
  );
};

export default CommonHeader;
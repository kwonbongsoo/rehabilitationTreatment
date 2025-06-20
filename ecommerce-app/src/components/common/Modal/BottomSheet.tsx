/**
 * 바텀 시트 컴포넌트 (모바일 최적화)
 */

import { ReactNode } from 'react';
import styles from '../Modal.module.css';
import { BaseModal } from './BaseModal';

/**
 * 바텀시트 Props
 */
export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  showCloseButton?: boolean;
  snapPoints?: number[];
}

/**
 * 바텀 시트 컴포넌트 (모바일 최적화)
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  className = '',
  title,
  showCloseButton = true,
}: BottomSheetProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={`${styles.bottomSheet} ${className}`}
      overlayClassName={styles.bottomSheetOverlay || ''}
      showCloseButton={false}
    >
      <div className={styles.bottomSheetHandle} />
      {(title || showCloseButton) && (
        <div className={styles.bottomSheetHeader}>
          {title && <h3 className={styles.bottomSheetTitle}>{title}</h3>}
          {showCloseButton && (
            <button className={styles.closeButton} onClick={onClose} aria-label="바텀 시트 닫기">
              ×
            </button>
          )}
        </div>
      )}
      <div className={styles.bottomSheetContent}>{children}</div>
    </BaseModal>
  );
}

export default BottomSheet;

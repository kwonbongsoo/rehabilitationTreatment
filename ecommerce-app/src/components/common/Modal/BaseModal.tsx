/**
 * 기본 모달 컴포넌트
 */

import React, { ReactElement, ReactNode, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from '../Modal.module.css';

/**
 * 모달 기본 Props
 */
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string | undefined;
  overlayClassName?: string | undefined;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

/**
 * 기본 모달 컴포넌트
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
}: BaseModalProps): ReactElement | null {
  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  // 스크롤 방지
  useEffect(() => {
    if (isOpen && preventScroll) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preventScroll]);

  // 키보드 이벤트 리스너
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className={`${styles.overlay} ${overlayClassName}`} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${className}`} role="dialog" aria-modal="true">
        {showCloseButton && (
          <button className={styles.closeButton} onClick={onClose} aria-label="모달 닫기">
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );

  // Portal을 사용하여 body에 렌더링
  return createPortal(modalContent, document.body);
}

export default BaseModal;

/**
 * 모달 컴포넌트
 *
 * 프로젝트 전반에서 사용되는 모달 패턴을 표준화
 * - 기본 모달
 * - 확인 다이얼로그
 * - 경고 다이얼로그
 * - 커스텀 모달
 * - 드로어 (사이드 패널)
 */

import React, { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

/**
 * 모달 기본 Props
 */
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

/**
 * 모달 컴포넌트
 */
export function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
}: BaseModalProps) {
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
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, preventScroll]);

  // 키보드 이벤트 리스너
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

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

/**
 * 확인 다이얼로그 Props
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

/**
 * 확인 다이얼로그 컴포넌트
 */
export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className={styles.dialog}>
      <div className={styles.dialogHeader}>
        <h3 className={styles.dialogTitle}>{title}</h3>
      </div>
      <div className={styles.dialogBody}>
        <p className={styles.dialogMessage}>{message}</p>
      </div>
      <div className={styles.dialogFooter}>
        <button className={styles.cancelButton} onClick={onCancel}>
          {cancelText}
        </button>
        <button className={`${styles.confirmButton} ${styles[variant]}`} onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

/**
 * 알림 다이얼로그 Props
 */
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * 알림 다이얼로그 컴포넌트
 */
export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '확인',
  variant = 'info',
}: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.dialog}>
      <div className={styles.dialogHeader}>
        <div className={`${styles.dialogIcon} ${styles[variant]}`}>
          {variant === 'success' && '✓'}
          {variant === 'warning' && '⚠'}
          {variant === 'error' && '✕'}
          {variant === 'info' && 'ℹ'}
        </div>
        <h3 className={styles.dialogTitle}>{title}</h3>
      </div>
      <div className={styles.dialogBody}>
        <p className={styles.dialogMessage}>{message}</p>
      </div>
      <div className={styles.dialogFooter}>
        <button className={`${styles.confirmButton} ${styles[variant]}`} onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}

/**
 * 드로어 Props
 */
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  title?: string;
  showCloseButton?: boolean;
}

/**
 * 드로어 컴포넌트 (사이드 패널)
 */
export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'medium',
  className = '',
  title,
  showCloseButton = true,
}: DrawerProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`${styles.drawer} ${styles[`drawer-${position}`]} ${styles[`drawer-${size}`]} ${className}`}
      overlayClassName={styles.drawerOverlay}
      showCloseButton={false}
    >
      {(title || showCloseButton) && (
        <div className={styles.drawerHeader}>
          {title && <h3 className={styles.drawerTitle}>{title}</h3>}
          {showCloseButton && (
            <button className={styles.closeButton} onClick={onClose} aria-label="드로어 닫기">
              ×
            </button>
          )}
        </div>
      )}
      <div className={styles.drawerContent}>{children}</div>
    </Modal>
  );
}

/**
 * 바텀 시트 Props
 */
interface BottomSheetProps {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`${styles.bottomSheet} ${className}`}
      overlayClassName={styles.bottomSheetOverlay}
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
    </Modal>
  );
}

/**
 * 모달 훅
 */
export function useModal(initialState: boolean = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen,
  };
}

/**
 * 확인 다이얼로그 훅
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant: 'default' | 'danger' | 'warning' = 'default',
    ) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        onConfirm,
        variant,
      });
    },
    [],
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    dialogState.onConfirm();
    closeDialog();
  }, [dialogState.onConfirm, closeDialog]);

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
      />
    ),
    [dialogState, handleConfirm, closeDialog],
  );

  return {
    showConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

/**
 * 모달 컴포넌트 - 다이나믹 로딩 엔트리 포인트
 *
 * 프로젝트 전반에서 사용되는 모달 패턴을 표준화
 * - 기본 모달
 * - 확인 다이얼로그
 * - 경고 다이얼로그
 * - 커스텀 모달
 * - 드로어 (사이드 패널)
 */

import dynamic from 'next/dynamic';
import React, { ComponentType, ReactNode } from 'react';

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
 * 확인 다이얼로그 Props
 */
export interface ConfirmDialogProps {
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
 * 알림 다이얼로그 Props
 */
export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * 드로어 Props
 */
export interface DrawerProps {
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

// 로딩 컴포넌트
const LoadingModal = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        minWidth: '200px',
        textAlign: 'center',
      }}
    >
      로딩 중...
    </div>
  </div>
);

// 다이나믹 컴포넌트들
export const Modal = dynamic(() => import('./Modal/BaseModal'), {
  loading: () => null,
  ssr: false,
}) as ComponentType<BaseModalProps>;

export const ConfirmDialog = dynamic(() => import('./Modal/ConfirmDialog'), {
  loading: () => <LoadingModal />,
  ssr: false,
}) as ComponentType<ConfirmDialogProps>;

export const AlertDialog = dynamic(() => import('./Modal/AlertDialog'), {
  loading: () => <LoadingModal />,
  ssr: false,
}) as ComponentType<AlertDialogProps>;

export const Drawer = dynamic(() => import('./Modal/Drawer'), {
  loading: () => <LoadingModal />,
  ssr: false,
}) as ComponentType<DrawerProps>;

export const BottomSheet = dynamic(() => import('./Modal/BottomSheet'), {
  loading: () => <LoadingModal />,
  ssr: false,
}) as ComponentType<BottomSheetProps>;

// 훅들은 Modal/index.ts에서 직접 export됨

// 편의를 위한 동기 훅 함수들 export (기본 기능만 제공)
export function useModalState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}

// 기본 export
export default Modal;

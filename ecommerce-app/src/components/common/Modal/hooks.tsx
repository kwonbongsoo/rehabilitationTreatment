/**
 * 모달 관련 훅들
 */

import { useCallback, useState } from 'react';

/**
 * 모달 훅
 */
export function useModal(initialState = false): {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  setIsOpen: (state: boolean) => void;
} {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback((): void => {
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
export function useConfirmDialog(): {
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: 'default' | 'danger' | 'warning',
  ) => void;
  confirmDialogProps: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    variant?: 'default' | 'danger' | 'warning';
  };
} {
  const [dialogState, setDialogState] = useState<{
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
  }, [dialogState, closeDialog]);

  return {
    showConfirm,
    confirmDialogProps: {
      isOpen: dialogState.isOpen,
      onConfirm: handleConfirm,
      onCancel: closeDialog,
      title: dialogState.title,
      message: dialogState.message,
      variant: dialogState.variant ?? 'default',
    },
  };
}

const modalHooks = {
  useModal,
  useConfirmDialog,
};

export default modalHooks;

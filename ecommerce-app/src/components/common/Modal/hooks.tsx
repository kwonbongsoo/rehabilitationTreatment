/**
 * 모달 관련 훅들
 */

import { useCallback, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * 모달 훅
 */
export function useModal(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

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

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant ?? 'default'}
      />
    ),
    [dialogState, handleConfirm, closeDialog],
  );

  return {
    showConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

const modalHooks = {
  useModal,
  useConfirmDialog,
};

export default modalHooks;

/**
 * 확인 다이얼로그 컴포넌트
 */

import styles from '../Modal.module.css';
import { BaseModal } from './BaseModal';

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
    <BaseModal isOpen={isOpen} onClose={onCancel} className={styles.dialog || ''}>
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
    </BaseModal>
  );
}

export default ConfirmDialog;

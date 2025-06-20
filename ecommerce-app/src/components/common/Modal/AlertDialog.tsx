/**
 * 알림 다이얼로그 컴포넌트
 */

import styles from '../Modal.module.css';
import { BaseModal } from './BaseModal';

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
    <BaseModal isOpen={isOpen} onClose={onClose} className={styles.dialog || ''}>
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
    </BaseModal>
  );
}

export default AlertDialog;

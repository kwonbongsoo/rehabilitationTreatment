/**
 * 드로어 컴포넌트 (사이드 패널)
 */

import { ReactElement, ReactNode } from 'react';
import styles from '../Modal.module.css';
import { BaseModal } from './BaseModal';

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
}: DrawerProps): ReactElement {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={`${styles.drawer} ${styles[`drawer-${position}`]} ${styles[`drawer-${size}`]} ${className}`}
      overlayClassName={styles.drawerOverlay || ''}
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
    </BaseModal>
  );
}

export default Drawer;

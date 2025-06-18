import React from 'react';
import styles from '@/styles/layout/Footer/CopyrightBar.module.css';

interface CopyrightBarProps {
  year?: number;
  companyName?: string;
}

const CopyrightBar: React.FC<CopyrightBarProps> = ({
  year = new Date().getFullYear(),
  companyName = 'SHOP',
}) => {
  return (
    <div className={styles.footerBottom}>
      <div className={styles.container}>
        <div className={styles.bottomContent}>
          <div className={styles.copyright}>
            &copy; {year} {companyName}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyrightBar;

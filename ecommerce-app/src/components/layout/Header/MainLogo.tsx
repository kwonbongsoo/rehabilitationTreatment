import React, { memo } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import styles from '@/styles/layout/Header/MainLogo.module.css';

interface MainLogoProps {
  logoImage?: string;
}

const MainLogo: React.FC<MainLogoProps> = memo(({ logoImage }) => {
  return (
    <Link href="/" className={styles.logo}>
      {logoImage ? (
        <div className={styles.logoImageWrapper}>
          <OptimizedImage src={logoImage} alt="SHOP 로고" width={120} height={40} priority />
        </div>
      ) : (
        <span className={styles.logoText}>SHOP</span>
      )}
    </Link>
  );
});

MainLogo.displayName = 'MainLogo';

export default MainLogo;

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/layout/Header/Header.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import PromoBar from './PromoBar';
import MainLogo from './MainLogo';
import MainNavigation from './MainNavigation';
import UserActions from './UserActions';
import SubNavigation from './SubNavigation';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 메뉴 닫기 함수
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header ref={headerRef} className={styles.header}>
      <PromoBar />

      <div className={styles.mainHeader}>
        <div className={styles.container}>
          {/* 모바일 메뉴 토글 버튼 */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <MainLogo />
          <MainNavigation isOpen={isMenuOpen} onClose={closeMenu} />
          <UserActions />
        </div>
      </div>

      <SubNavigation />

      {/* 모바일 메뉴 오버레이 */}
      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
    </header>
  );
};

export default Header;

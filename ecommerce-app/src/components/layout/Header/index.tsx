import React, { useState, useEffect } from 'react';
import styles from '@/styles/layout/Header/Header.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import PromoBar from './PromoBar';
import MainLogo from './MainLogo';
import MainNavigation from './MainNavigation';
import UserActions from './UserActions';
import SubNavigation from './SubNavigation';

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 스크롤 이벤트 감지
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
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
                    <MainNavigation isOpen={isMenuOpen} />
                    <UserActions />
                </div>
            </div>

            <SubNavigation visible={!isScrolled} />
        </header>
    );
};

export default Header;
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';
import styles from '@/styles/common/Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

// Footer를 숨길 페이지 경로들을 상수로 관리
const PAGES_WITHOUT_FOOTER = [
    '/auth/login',
    '/auth/register',
    // '/auth/forgot-password',
    // '/auth/reset-password'
] as const;

// Footer 표시 여부를 결정하는 순수 함수
const shouldShowFooter = (pathname: string): boolean => {
    // auth 관련 페이지에서는 Footer를 숨김
    if (pathname.startsWith('/auth/')) {
        return false;
    }
    return true;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const showFooter = shouldShowFooter(router.pathname);

    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>{children}</main>
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;
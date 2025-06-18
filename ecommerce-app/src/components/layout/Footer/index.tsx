import React from 'react';
import styles from '@/styles/layout/Footer/Footer.module.css';
import FooterLinks from './FooterLinks';
import CopyrightBar from './CopyrightBar';

const Footer: React.FC = () => {
  // 핵심 링크만 유지 (CLS 최적화)
  const essentialLinks = [
    { href: '/contact', label: '문의하기' },
    { href: '/returns', label: '교환/반품' },
    { href: '/privacy', label: '개인정보처리방침' },
    { href: '/terms', label: '이용약관' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <FooterLinks title="고객센터" links={essentialLinks} />
        </div>
      </div>
      <CopyrightBar />
    </footer>
  );
};

export default Footer;

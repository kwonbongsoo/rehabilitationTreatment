import React from 'react';
import styles from '@/styles/layout/Footer/Footer.module.css';
import NewsletterSection from './NewsletterSection';
import FooterLinks from './FooterLinks';
import ContactInfo from './ContactInfo';
import CopyrightBar from './CopyrightBar';

const Footer: React.FC = () => {
    // 링크 데이터 정의
    const shopLinks = [
        { href: "/category/women", label: "여성" },
        { href: "/category/men", label: "남성" },
        { href: "/category/kids", label: "키즈" },
        { href: "/category/accessories", label: "액세서리" },
        { href: "/category/sale", label: "세일" },
        { href: "/new-arrivals", label: "신상품" }
    ];

    const serviceLinks = [
        { href: "/contact", label: "문의하기" },
        { href: "/shipping", label: "배송 안내" },
        { href: "/returns", label: "교환 및 반품" },
        { href: "/order-tracking", label: "주문 조회" },
        { href: "/size-guide", label: "사이즈 가이드" },
        { href: "/faq", label: "FAQ" }
    ];

    const aboutLinks = [
        { href: "/about", label: "브랜드 소개" },
        { href: "/careers", label: "채용 정보" },
        { href: "/sustainability", label: "지속가능성" },
        { href: "/press", label: "보도자료" },
        { href: "/stores", label: "매장 안내" }
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.container}>
                    <NewsletterSection />

                    <div className={styles.footerLinks}>
                        <FooterLinks title="쇼핑하기" links={shopLinks} />
                        <FooterLinks title="고객 서비스" links={serviceLinks} />
                        <FooterLinks title="회사 소개" links={aboutLinks} />
                        <ContactInfo />
                    </div>
                </div>
            </div>

            <CopyrightBar />
        </footer>
    );
};

export default Footer;
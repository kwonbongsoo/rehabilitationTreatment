import React from 'react';
import Link from 'next/link';
import styles from '@/styles/layout/Footer/CopyrightBar.module.css';
import PaymentMethods from './PaymentMethods';

interface LegalLink {
    href: string;
    label: string;
}

interface CopyrightBarProps {
    year?: number;
    companyName?: string;
    legalLinks?: LegalLink[];
}

const CopyrightBar: React.FC<CopyrightBarProps> = ({
    year = new Date().getFullYear(),
    companyName = "SHOP",
    legalLinks = [
        { href: "/privacy", label: "개인정보처리방침" },
        { href: "/terms", label: "이용약관" },
        { href: "/compliance", label: "공정거래준수" }
    ]
}) => {
    return (
        <div className={styles.footerBottom}>
            <div className={styles.container}>
                <div className={styles.bottomContent}>
                    <div className={styles.copyright}>
                        &copy; {year} {companyName}. All rights reserved.
                    </div>
                    <div className={styles.legalLinks}>
                        {legalLinks.map((link, index) => (
                            <Link key={index} href={link.href}>{link.label}</Link>
                        ))}
                    </div>
                    {/* <PaymentMethods /> */}
                </div>
            </div>
        </div>
    );
};

export default CopyrightBar;
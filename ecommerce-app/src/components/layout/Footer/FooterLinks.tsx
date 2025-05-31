import React from 'react';
import Link from 'next/link';
import styles from '@/styles/layout/Footer/FooterLinks.module.css';

interface LinkItem {
    href: string;
    label: string;
}

interface FooterLinksProps {
    title: string;
    links: LinkItem[];
}

const FooterLinks: React.FC<FooterLinksProps> = ({ title, links }) => {
    return (
        <div className={styles.linkColumn}>
            <h4>{title}</h4>
            <div className={styles.horizontalLinkContainer}>
                <ul className={styles.horizontalLinks}>
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link href={link.href}>{link.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FooterLinks;
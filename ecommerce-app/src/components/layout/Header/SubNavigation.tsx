import React from 'react';
import Link from 'next/link';
import styles from '@/styles/layout/Header/SubNavigation.module.css';

interface SubItem {
    href: string;
    label: string;
}

interface SubNavigationProps {
    visible: boolean;
    items?: SubItem[];
}

const SubNavigation: React.FC<SubNavigationProps> = ({
    visible, items = [
        { href: "/new-arrivals", label: "신상품" },
        { href: "/best-sellers", label: "베스트셀러" },
        { href: "/collections/summer", label: "여름 컬렉션" },
        { href: "/sustainability", label: "지속가능한 패션" }
    ]
}) => {
    return (
        <div className={`${styles.subNav} ${visible ? '' : styles.hidden}`}>
            <div className={styles.container}>
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubNavigation;
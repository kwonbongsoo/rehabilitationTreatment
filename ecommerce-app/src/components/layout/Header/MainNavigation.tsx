import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/layout/Header/MainNavigation.module.css';

interface Category {
    href: string;
    label: string;
    isSale?: boolean;
}

interface MainNavigationProps {
    isOpen: boolean;
    categories?: Category[];
}

const MainNavigation: React.FC<MainNavigationProps> = ({
    isOpen,
    categories = [
        { href: "/category/women", label: "여성" },
        { href: "/category/men", label: "남성" },
        { href: "/category/kids", label: "키즈" },
        { href: "/category/accessories", label: "액세서리" },
        { href: "/category/sale", label: "세일", isSale: true }
    ]
}) => {
    const router = useRouter();

    return (
        <nav className={`${styles.mainNav} ${isOpen ? styles.active : ''}`}>
            <ul>
                {categories.map((category, index) => (
                    <li
                        key={index}
                        className={router.pathname === category.href ? styles.active : ''}
                    >
                        <Link
                            href={category.href}
                            className={category.isSale ? styles.saleLink : ''}
                        >
                            {category.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default MainNavigation;
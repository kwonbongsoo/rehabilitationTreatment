import React from 'react';
import Link from 'next/link';
import { FiHeart, FiUser, FiShoppingCart } from 'react-icons/fi';
import styles from '@/styles/layout/Header/UserActions.module.css';
import SearchBar from './SearchBar';

interface UserActionsProps {
    cartItemCount?: number;
}

const UserActions: React.FC<UserActionsProps> = ({ cartItemCount = 3 }) => {
    return (
        <div className={styles.userActions}>
            <SearchBar />

            {/* 위시리스트 */}
            <Link href="/wishlist" className={styles.iconButton} aria-label="위시리스트">
                <FiHeart size={20} />
            </Link>

            {/* 사용자 계정 */}
            <Link href={false ? "/account" : "/auth/login"} className={styles.iconButton} aria-label="내 계정">
                <FiUser size={20} />
                {false && <span className={styles.userIndicator}></span>}
            </Link>

            {/* 장바구니 */}
            <Link href="/cart" className={styles.cartButton} aria-label="장바구니">
                <FiShoppingCart size={20} />
                {cartItemCount > 0 && <span className={styles.cartCount}>{cartItemCount}</span>}
            </Link>
        </div>
    );
};

export default UserActions;
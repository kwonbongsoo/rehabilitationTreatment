import React from 'react';
import Link from 'next/link';
import { FiHeart, FiUser, FiShoppingCart } from 'react-icons/fi';
import styles from '@/styles/layout/Header/UserActions.module.css';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import SearchBar from './SearchBar';

interface UserActionsProps {
    cartItemCount?: number;
}

const UserActions: React.FC<UserActionsProps> = ({ cartItemCount = 3 }) => {
    const { data: user } = useCurrentUser();

    return (
        <div className={styles.userActions}>
            <SearchBar />

            {/* 위시리스트 */}
            <Link href="/wishlist" className={styles.iconButton} aria-label="위시리스트">
                <FiHeart size={20} />
            </Link>

            {/* 사용자 계정 */}
            <Link href={user ? "/account" : "/auth/login"} className={styles.iconButton} aria-label="내 계정">
                <FiUser size={20} />
                {user && <span className={styles.userIndicator}></span>}
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
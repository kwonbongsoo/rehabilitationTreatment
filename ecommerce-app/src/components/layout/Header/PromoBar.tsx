import React from 'react';
import styles from '@/styles/layout/Header/PromoBar.module.css';

interface PromoBarProps {
    message?: string;
}

const PromoBar: React.FC<PromoBarProps> = ({ message = "무료 배송 이벤트: 5만원 이상 구매 시" }) => {
    return (
        <div className={styles.promoBar}>
            <p>{message}</p>
        </div>
    );
};

export default PromoBar;
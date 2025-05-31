import React from 'react';
import styles from '@/styles/layout/Footer/NewsletterSection.module.css';

const NewsletterSection: React.FC = () => {
    const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('뉴스레터 구독이 완료되었습니다.');
    };

    return (
        <div className={styles.newsletterSection}>
            <h3>SHOP의 소식을 먼저 받아보세요</h3>
            <p>신상품 소식, 특별 프로모션, 스타일 팁을 받아보세요.</p>
            <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
                <div className={styles.inputGroup}>
                    <input
                        type="email"
                        placeholder="이메일 주소"
                        required
                        aria-label="이메일 주소"
                    />
                    <button type="submit">구독하기</button>
                </div>
                <label className={styles.checkboxLabel}>
                    <input type="checkbox" required />
                    <span>개인정보 수집 및 마케팅 정보 수신에 동의합니다.</span>
                </label>
            </form>
        </div>
    );
};

export default NewsletterSection;
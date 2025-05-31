import React from 'react';
import styles from '@/styles/layout/Footer/ContactInfo.module.css';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';

const ContactInfo: React.FC = () => {
    return (
        <div className={styles.contactColumn}>
            <h4>연락처</h4>
            <address>
                <p>서울특별시 강남구 테헤란로 123</p>
                <p>고객센터: 1588-1234</p>
                <p>이메일: <a href="mailto:help@shopapp.com">help@shopapp.com</a></p>
                <p>운영시간: 평일 10:00 - 18:00</p>
            </address>

            <div className={styles.socialLinks}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FiInstagram size={20} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FiFacebook size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FiTwitter size={20} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <FiYoutube size={20} />
                </a>
            </div>
        </div>
    );
};

export default ContactInfo;
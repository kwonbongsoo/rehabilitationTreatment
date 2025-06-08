import React from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import styles from '@/styles/layout/Footer/PaymentMethods.module.css';

interface PaymentMethodsProps {
    label?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ label = "안전한 결제" }) => {
    const paymentOptions = [
        { src: "/images/payment/visa.png", alt: "비자" },
        { src: "/images/payment/mastercard.png", alt: "마스터카드" },
        { src: "/images/payment/kakaopay.png", alt: "카카오페이" },
        { src: "/images/payment/naverpay.png", alt: "네이버페이" }
    ];

    return (
        <div className={styles.paymentMethods}>
            <span>{label}</span>
            <div className={styles.paymentIcons}>
                {paymentOptions.map((option, index) => (
                    <span key={index} className={styles.paymentIcon}>
                        <OptimizedImage
                            src={option.src}
                            alt={option.alt}
                            width={32}
                            height={20}
                            unoptimized
                        />
                    </span>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethods;
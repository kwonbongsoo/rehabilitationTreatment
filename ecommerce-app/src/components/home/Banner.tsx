import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/home/Banner.module.css';

// 더미 데이터
const sliderImages = [
    { id: 1, src: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg', alt: '여름 시즌 세일', link: '/products/seasonal' },
    { id: 2, src: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg', alt: '신상품 컬렉션', link: '/products/new' },
    { id: 3, src: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg', alt: '특별 할인 이벤트', link: '/products/sale' },
];

export default function Banner() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // 슬라이더 자동 재생
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className={styles.sliderSection}>
            <div className={styles.slider}>
                {sliderImages.map((image, index) => (
                    <div
                        key={image.id}
                        className={`${styles.slide} ${index === currentSlide ? styles.activeSlide : ''}`}
                    >
                        <div className={styles.imageContainer}>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className={styles.sliderImage}
                            />
                        </div>
                        <div className={styles.slideContent}>
                            <h2>{image.alt}</h2>
                            <Link href={image.link} className={styles.sliderButton}>
                                지금 보기
                            </Link>
                        </div>
                    </div>
                ))}

                <div className={styles.sliderDots}>
                    {sliderImages.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`슬라이드 ${index + 1}로 이동`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
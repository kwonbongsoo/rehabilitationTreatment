import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/home/Banner.module.css';

interface BannerProps {
    slides: {
        id: number;
        src: string;
        alt: string;
        link: string;
    }[];
}

export default function Banner({ slides }: BannerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // 슬라이더 자동 재생
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    if (slides.length === 0) return null;

    return (
        <section className={styles.sliderSection}>
            <div className={styles.slider}>
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`${styles.slide} ${index === currentSlide ? styles.activeSlide : ''}`}
                    >
                        <div className={styles.imageContainer}>
                            <Image
                                src={slide.src}
                                alt={slide.alt}
                                fill
                                sizes="100vw"
                                priority={index === 0} // 첫 번째 슬라이드만 우선순위
                                className={styles.sliderImage}
                            />
                        </div>
                        <div className={styles.slideContent}>
                            <h2>{slide.alt}</h2>
                            <Link href={slide.link} className={styles.sliderButton}>
                                지금 보기
                            </Link>
                        </div>
                    </div>
                ))}

                {slides.length > 1 && (
                    <div className={styles.sliderDots}>
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`슬라이드 ${index + 1}로 이동`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
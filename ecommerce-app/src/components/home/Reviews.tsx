import SectionTitle from '@/components/common/SectionTitle';
import Rating from '@/components/common/Rating';
import styles from '@/styles/home/Reviews.module.css';

// 더미 데이터
const reviews = [
    {
        id: 1,
        name: '김지현',
        initials: 'JK',
        rating: 5,
        text: '배송이 빠르고 상품 퀄리티가 정말 좋아요! 다음에도 여기서 구매할 예정입니다.',
        product: '캐주얼 데님 자켓'
    },
    {
        id: 2,
        name: '이수진',
        initials: 'SJ',
        rating: 4.5,
        text: '가격 대비 퀄리티가 훌륭해요. 사이즈도 딱 맞고 디자인이 세련되어서 마음에 들어요!',
        product: '미니멀 백팩'
    },
    {
        id: 3,
        name: '박민호',
        initials: 'MH',
        rating: 5,
        text: '오래 찾던 디자인을 여기서 발견했어요. 품질도 좋고 착용감이 정말 편안합니다.',
        product: '클래식 운동화'
    }
];

export default function Reviews() {
    return (
        <section className={styles.reviewsSection}>
            <SectionTitle title="고객 후기" />
            <div className={styles.reviewsContainer}>
                {reviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewerAvatar}>{review.initials}</div>
                            <div className={styles.reviewerInfo}>
                                <h4>{review.name}</h4>
                                <Rating rating={review.rating} />
                            </div>
                        </div>
                        <p className={styles.reviewText}>"{review.text}"</p>
                        <p className={styles.reviewProduct}>구매 상품: {review.product}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
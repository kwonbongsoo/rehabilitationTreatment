// 기본적인 사용 예시
export const basicBannerExample = {
    slides: [
        {
            id: 1,
            src: '/images/banner1.jpg',
            alt: '여름 세일',
            title: '여름 대세일',
            description: '최대 70% 할인된 가격으로 만나보세요',
            link: '/collections/summer-sale',
            buttonText: '지금 쇼핑하기'
        },
        {
            id: 2,
            src: '/images/banner2.jpg',
            alt: '신상품 컬렉션',
            title: '2024 신상품 컬렉션',
            description: '트렌디한 스타일의 새로운 아이템들',
            link: '/collections/new-arrivals',
            buttonText: '컬렉션 보기'
        }
    ]
};

// 고급 설정 예시
export const advancedBannerExample = {
    slides: basicBannerExample.slides,
    autoPlay: true,
    autoPlayInterval: 7000, // 7초
    showDots: true,
    showArrows: true,
    imageSizes: "(max-width: 360px) 100vw, (max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px",
    className: "custom-banner"
};

// 자동 재생 비활성화 예시
export const staticBannerExample = {
    slides: basicBannerExample.slides,
    autoPlay: false,
    showDots: true,
    showArrows: true
};

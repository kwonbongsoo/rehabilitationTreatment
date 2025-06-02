import React from 'react';
import styles from './NewArrivals.module.css';

const NewArrivalsPage: React.FC = () => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>신상품</h1>
                    <p className={styles.subtitle}>
                        최신 트렌드를 반영한 새로운 상품들을 만나보세요
                    </p>
                </div>

                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>카테고리:</label>
                        <select>
                            <option value="">전체</option>
                            <option value="tops">상의</option>
                            <option value="bottoms">하의</option>
                            <option value="dresses">원피스</option>
                            <option value="accessories">액세서리</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>정렬:</label>
                        <select>
                            <option value="newest">최신순</option>
                            <option value="price-low">가격 낮은순</option>
                            <option value="price-high">가격 높은순</option>
                            <option value="popular">인기순</option>
                        </select>
                    </div>
                </div>

                <div className={styles.productGrid}>
                    <div className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg" alt="신상품 1" />
                            <div className={styles.newBadge}>NEW</div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>모던 블레이저</h3>
                            <p className={styles.price}>129,000원</p>
                            <div className={styles.colors}>
                                <span className={styles.colorOption} style={{ backgroundColor: '#000' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#navy' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#beige' }}></span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg" alt="신상품 2" />
                            <div className={styles.newBadge}>NEW</div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>실크 블라우스</h3>
                            <p className={styles.price}>89,000원</p>
                            <div className={styles.colors}>
                                <span className={styles.colorOption} style={{ backgroundColor: '#white' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#pink' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#mint' }}></span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg" alt="신상품 3" />
                            <div className={styles.newBadge}>NEW</div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>미니멀 원피스</h3>
                            <p className={styles.price}>156,000원</p>
                            <div className={styles.colors}>
                                <span className={styles.colorOption} style={{ backgroundColor: '#black' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#grey' }}></span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg" alt="신상품 4" />
                            <div className={styles.newBadge}>NEW</div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>레더 백</h3>
                            <p className={styles.price}>198,000원</p>
                            <div className={styles.colors}>
                                <span className={styles.colorOption} style={{ backgroundColor: '#brown' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#black' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#red' }}></span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg" alt="신상품 5" />
                            <div className={styles.newBadge}>NEW</div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>와이드 팬츠</h3>
                            <p className={styles.price}>79,000원</p>
                            <div className={styles.colors}>
                                <span className={styles.colorOption} style={{ backgroundColor: '#khaki' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#navy' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#charcoal' }}></span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg" alt="신상품 6" />
                            <div className={styles.newBadge}>NEW</div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>니트 카디건</h3>
                            <p className={styles.price}>112,000원</p>
                            <div className={styles.colors}>
                                <span className={styles.colorOption} style={{ backgroundColor: '#cream' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#lavender' }}></span>
                                <span className={styles.colorOption} style={{ backgroundColor: '#sage' }}></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.loadMore}>
                    <button className={styles.loadMoreButton}>더 보기</button>
                </div>
            </div>
        </>
    );
};

export default NewArrivalsPage;

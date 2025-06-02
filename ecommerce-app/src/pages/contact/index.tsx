import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import styles from './Contact.module.css';

const ContactPage: React.FC = () => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>문의하기</h1>
                    <p className={styles.subtitle}>
                        궁금한 사항이 있으시면 언제든지 연락주세요. 최대한 빠르게 답변드리겠습니다.
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.contactInfo}>
                        <h2>연락처 정보</h2>

                        <div className={styles.contactItem}>
                            <FiPhone className={styles.icon} />
                            <div>
                                <h3>전화 문의</h3>
                                <p>1588-0000</p>
                                <p className={styles.note}>평일 09:00 - 18:00</p>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <FiMail className={styles.icon} />
                            <div>
                                <h3>이메일 문의</h3>
                                <p>support@ecommerce.com</p>
                                <p className={styles.note}>24시간 접수 가능</p>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <FiMapPin className={styles.icon} />
                            <div>
                                <h3>본사 주소</h3>
                                <p>서울특별시 강남구 테헤란로 123</p>
                                <p>ABC빌딩 10층</p>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <FiClock className={styles.icon} />
                            <div>
                                <h3>운영 시간</h3>
                                <p>평일: 09:00 - 18:00</p>
                                <p>주말 및 공휴일: 휴무</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contactForm}>
                        <h2>문의 양식</h2>
                        <form className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">이름 *</label>
                                <input type="text" id="name" name="name" required />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">이메일 *</label>
                                <input type="email" id="email" name="email" required />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone">전화번호</label>
                                <input type="tel" id="phone" name="phone" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">문의 유형 *</label>
                                <select id="subject" name="subject" required>
                                    <option value="">선택해주세요</option>
                                    <option value="order">주문 관련</option>
                                    <option value="product">상품 관련</option>
                                    <option value="shipping">배송 관련</option>
                                    <option value="return">교환/반품</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">문의 내용 *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    placeholder="문의하실 내용을 자세히 적어주세요"
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitButton}>
                                문의 보내기
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;

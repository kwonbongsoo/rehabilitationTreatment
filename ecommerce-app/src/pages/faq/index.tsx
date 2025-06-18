import { useState } from 'react';
import Head from 'next/head';
import styles from './FAQ.module.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: '주문은 어떻게 하나요?',
      answer:
        '웹사이트에서 원하는 상품을 선택하고 장바구니에 담은 후 결제를 진행하시면 됩니다. 회원가입 후 주문하시면 주문 내역을 더 쉽게 확인할 수 있습니다.',
      category: 'order',
    },
    {
      id: 2,
      question: '배송은 얼마나 걸리나요?',
      answer:
        '일반 배송은 주문 후 2-3일, 당일 배송은 오후 2시 이전 주문 시 당일 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다.',
      category: 'shipping',
    },
    {
      id: 3,
      question: '교환/환불은 어떻게 하나요?',
      answer:
        '상품 수령 후 7일 이내에 교환/환불 신청이 가능합니다. 마이페이지에서 신청하거나 고객센터로 연락주시면 됩니다.',
      category: 'return',
    },
    {
      id: 4,
      question: '결제 방법은 어떤 것이 있나요?',
      answer:
        '신용카드, 체크카드, 계좌이체, 무통장입금, 카카오페이, 네이버페이 등 다양한 결제 방법을 지원합니다.',
      category: 'payment',
    },
    {
      id: 5,
      question: '사이즈 가이드는 어디서 확인하나요?',
      answer:
        '각 상품 상세 페이지에서 사이즈 가이드를 확인할 수 있습니다. 브랜드별로 사이즈가 다를 수 있으니 구매 전 반드시 확인해주세요.',
      category: 'size',
    },
    {
      id: 6,
      question: '회원 혜택은 무엇인가요?',
      answer:
        '회원가입 시 적립금 지급, 생일 쿠폰, 등급별 할인 혜택, 신상품 우선 알림 등 다양한 혜택을 받으실 수 있습니다.',
      category: 'membership',
    },
    {
      id: 7,
      question: '재고가 없는 상품은 언제 입고되나요?',
      answer:
        '재입고 알림 신청을 하시면 상품이 입고될 때 알림을 보내드립니다. 정확한 입고 일정은 브랜드사 사정에 따라 달라질 수 있습니다.',
      category: 'stock',
    },
    {
      id: 8,
      question: '쿠폰은 어떻게 사용하나요?',
      answer:
        '결제 시 쿠폰 적용란에서 보유하신 쿠폰을 선택하여 사용하실 수 있습니다. 쿠폰별로 사용 조건이 다르니 확인 후 사용해주세요.',
      category: 'coupon',
    },
  ];

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'order', label: '주문' },
    { value: 'shipping', label: '배송' },
    { value: 'return', label: '교환/환불' },
    { value: 'payment', label: '결제' },
    { value: 'size', label: '사이즈' },
    { value: 'membership', label: '회원' },
    { value: 'stock', label: '재고' },
    { value: 'coupon', label: '쿠폰' },
  ];

  const filteredFAQ =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>자주 묻는 질문 - StyleShop</title>
        <meta name="description" content="StyleShop 자주 묻는 질문과 답변을 확인하세요." />
      </Head>

      <div className={styles.header}>
        <h1>자주 묻는 질문</h1>
        <p>고객님들이 자주 문의하시는 내용을 정리했습니다.</p>
      </div>

      <div className={styles.categoryFilter}>
        {categories.map((category) => (
          <button
            key={category.value}
            className={`${styles.categoryButton} ${
              selectedCategory === category.value ? styles.active : ''
            }`}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.faqList}>
        {filteredFAQ.map((item) => (
          <div key={item.id} className={styles.faqItem}>
            <button className={styles.question} onClick={() => toggleItem(item.id)}>
              <span>Q. {item.question}</span>
              <span className={`${styles.icon} ${openItems.includes(item.id) ? styles.open : ''}`}>
                ▼
              </span>
            </button>
            {openItems.includes(item.id) && (
              <div className={styles.answer}>
                <p>A. {item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.contactInfo}>
        <h3>원하는 답변을 찾지 못하셨나요?</h3>
        <p>고객센터로 문의해주시면 친절하게 답변드리겠습니다.</p>
        <div className={styles.contactDetails}>
          <div>
            <strong>고객센터 전화</strong>
            <p>1588-1234 (평일 9:00~18:00)</p>
          </div>
          <div>
            <strong>온라인 문의</strong>
            <p>1:1 문의하기를 이용해주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

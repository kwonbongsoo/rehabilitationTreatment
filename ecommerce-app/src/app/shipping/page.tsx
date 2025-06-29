'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function Shipping() {
  const [selectedTab, setSelectedTab] = useState('delivery');

  const deliveryOptions = [
    {
      type: '일반배송',
      price: '무료',
      time: '2-3일',
      description: '50,000원 이상 주문 시 무료배송',
      icon: '🚚',
    },
    {
      type: '당일배송',
      price: '5,000원',
      time: '당일',
      description: '오후 2시 이전 주문 시 (서울/경기 일부)',
      icon: '⚡',
    },
    {
      type: '새벽배송',
      price: '3,000원',
      time: '다음날 오전 7시',
      description: '밤 11시 이전 주문 시 (서울 일부)',
      icon: '🌅',
    },
  ];

  const shippingZones = [
    {
      zone: '서울/경기/인천',
      standardDays: '1-2일',
      expressDays: '당일 가능',
      additionalFee: '없음',
    },
    {
      zone: '대전/충청/세종',
      standardDays: '2-3일',
      expressDays: '1-2일',
      additionalFee: '없음',
    },
    {
      zone: '대구/부산/울산/경상',
      standardDays: '2-3일',
      expressDays: '1-2일',
      additionalFee: '없음',
    },
    {
      zone: '광주/전라',
      standardDays: '2-3일',
      expressDays: '1-2일',
      additionalFee: '없음',
    },
    {
      zone: '강원/제주',
      standardDays: '3-4일',
      expressDays: '2-3일',
      additionalFee: '3,000원',
    },
    {
      zone: '도서산간',
      standardDays: '4-7일',
      expressDays: '불가',
      additionalFee: '5,000-15,000원',
    },
  ];

  const trackingSteps = [
    { status: '주문접수', description: '주문이 정상적으로 접수되었습니다.' },
    { status: '결제완료', description: '결제가 완료되었습니다.' },
    { status: '상품준비중', description: '상품을 포장하고 있습니다.' },
    { status: '배송시작', description: '상품이 배송을 시작했습니다.' },
    { status: '배송중', description: '상품이 배송 중입니다.' },
    { status: '배송완료', description: '상품이 배송 완료되었습니다.' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>배송 안내</h1>
        <p>빠르고 안전한 배송으로 고객님께 상품을 전달합니다.</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${selectedTab === 'delivery' ? styles.active : ''}`}
          onClick={() => setSelectedTab('delivery')}
          role="tab"
          aria-selected={selectedTab === 'delivery'}
          aria-controls="delivery-panel"
        >
          배송 옵션
        </button>
        <button
          className={`${styles.tab} ${selectedTab === 'zones' ? styles.active : ''}`}
          onClick={() => setSelectedTab('zones')}
        >
          지역별 배송
        </button>
        <button
          className={`${styles.tab} ${selectedTab === 'tracking' ? styles.active : ''}`}
          onClick={() => setSelectedTab('tracking')}
        >
          배송 조회
        </button>
        <button
          className={`${styles.tab} ${selectedTab === 'policy' ? styles.active : ''}`}
          onClick={() => setSelectedTab('policy')}
        >
          배송 정책
        </button>
      </div>

      {selectedTab === 'delivery' && (
        <div className={styles.tabContent}>
          <h2>배송 옵션</h2>
          <div className={styles.deliveryGrid}>
            {deliveryOptions.map((option, index) => (
              <div key={index} className={styles.deliveryCard}>
                <div className={styles.deliveryIcon}>{option.icon}</div>
                <h3>{option.type}</h3>
                <div className={styles.deliveryPrice}>{option.price}</div>
                <div className={styles.deliveryTime}>배송시간: {option.time}</div>
                <p>{option.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.freeShippingInfo}>
            <h3>🎁 무료배송 혜택</h3>
            <ul>
              <li>50,000원 이상 주문 시 무료배송</li>
              <li>회원등급별 무료배송 혜택</li>
              <li>특정 브랜드 상품 무료배송</li>
              <li>이벤트 기간 중 무료배송</li>
            </ul>
          </div>
        </div>
      )}

      {selectedTab === 'zones' && (
        <div className={styles.tabContent}>
          <h2>지역별 배송 안내</h2>
          <div className={styles.zonesTable}>
            <div className={styles.tableHeader}>
              <div>배송 지역</div>
              <div>일반배송</div>
              <div>빠른배송</div>
              <div>추가 배송비</div>
            </div>
            {shippingZones.map((zone, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.zoneName}>{zone.zone}</div>
                <div>{zone.standardDays}</div>
                <div>{zone.expressDays}</div>
                <div>{zone.additionalFee}</div>
              </div>
            ))}
          </div>

          <div className={styles.zoneNotice}>
            <h3>⚠️ 배송 제한 지역</h3>
            <ul>
              <li>일부 도서산간 지역은 배송이 불가할 수 있습니다.</li>
              <li>군부대, PO Box는 배송이 제한됩니다.</li>
              <li>해외 배송은 별도 문의 바랍니다.</li>
            </ul>
          </div>
        </div>
      )}

      {selectedTab === 'tracking' && (
        <div className={styles.tabContent}>
          <h2>배송 조회</h2>

          <div className={styles.trackingForm}>
            <h3>주문 배송 조회</h3>
            <div className={styles.trackingInputs}>
              <input type="text" placeholder="주문번호를 입력하세요" />
              <button className={styles.trackingButton}>조회하기</button>
            </div>
          </div>

          <div className={styles.trackingSteps}>
            <h3>배송 단계</h3>
            <div className={styles.stepsContainer}>
              {trackingSteps.map((step, index) => (
                <div key={index} className={styles.step}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepContent}>
                    <h4>{step.status}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'policy' && (
        <div className={styles.tabContent}>
          <h2>배송 정책</h2>
          <div className={styles.policyContent}>
            <div className={styles.policySection}>
              <h3>📦 배송 준비</h3>
              <ul>
                <li>평일 오후 3시 이전 주문: 당일 출고</li>
                <li>평일 오후 3시 이후 주문: 다음 영업일 출고</li>
                <li>주말/공휴일 주문: 다음 영업일 출고</li>
              </ul>
            </div>

            <div className={styles.policySection}>
              <h3>🚛 배송업체</h3>
              <ul>
                <li>CJ대한통운</li>
                <li>롯데택배</li>
                <li>한진택배</li>
              </ul>
            </div>

            <div className={styles.policySection}>
              <h3>📞 배송 문의</h3>
              <p>배송 관련 문의사항이 있으시면 고객센터로 연락주세요.</p>
              <p>
                <strong>고객센터:</strong> 1588-0000 (평일 9:00-18:00)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

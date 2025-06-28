'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

// 타입 정의
interface ClothingSize {
  size: string;
  chest: string;
  waist: string;
  hip: string;
  length: string;
}

interface ShoeSize {
  kor: string;
  us: string;
  uk: string;
  eu: string;
  cm: string;
}

export default function SizeGuide() {
  const [selectedCategory, setSelectedCategory] = useState('women');
  const [selectedType, setSelectedType] = useState('clothing');

  const categories = [
    { value: 'women', label: '여성' },
    { value: 'men', label: '남성' },
    { value: 'kids', label: '키즈' },
  ];
  const types = [
    { value: 'clothing', label: '의류' },
    { value: 'shoes', label: '신발' },
    { value: 'accessories', label: '액세서리' },
  ];

  const womenClothingSizes: ClothingSize[] = [
    { size: 'XS', chest: '78-82', waist: '58-62', hip: '82-86', length: '155-160' },
    { size: 'S', chest: '82-86', waist: '62-66', hip: '86-90', length: '160-165' },
    { size: 'M', chest: '86-90', waist: '66-70', hip: '90-94', length: '165-170' },
    { size: 'L', chest: '90-94', waist: '70-74', hip: '94-98', length: '170-175' },
    { size: 'XL', chest: '94-98', waist: '74-78', hip: '98-102', length: '175-180' },
  ];

  const menClothingSizes: ClothingSize[] = [
    { size: 'S', chest: '88-92', waist: '70-74', hip: '88-92', length: '165-170' },
    { size: 'M', chest: '92-96', waist: '74-78', hip: '92-96', length: '170-175' },
    { size: 'L', chest: '96-100', waist: '78-82', hip: '96-100', length: '175-180' },
    { size: 'XL', chest: '100-104', waist: '82-86', hip: '100-104', length: '180-185' },
    { size: 'XXL', chest: '104-108', waist: '86-90', hip: '104-108', length: '185-190' },
  ];

  const kidsClothingSizes: ClothingSize[] = [
    { size: '100', chest: '52-56', waist: '46-50', hip: '54-58', length: '95-105' },
    { size: '110', chest: '56-60', waist: '50-54', hip: '58-62', length: '105-115' },
    { size: '120', chest: '60-64', waist: '54-58', hip: '62-66', length: '115-125' },
    { size: '130', chest: '64-68', waist: '58-62', hip: '66-70', length: '125-135' },
    { size: '140', chest: '68-72', waist: '62-66', hip: '70-74', length: '135-145' },
    { size: '150', chest: '72-76', waist: '66-70', hip: '74-78', length: '145-155' },
  ];

  const shoeSizes: ShoeSize[] = [
    { kor: '220', us: '5', uk: '3', eu: '35', cm: '22.0' },
    { kor: '225', us: '5.5', uk: '3.5', eu: '36', cm: '22.5' },
    { kor: '230', us: '6', uk: '4', eu: '36.5', cm: '23.0' },
    { kor: '235', us: '6.5', uk: '4.5', eu: '37', cm: '23.5' },
    { kor: '240', us: '7', uk: '5', eu: '38', cm: '24.0' },
    { kor: '245', us: '7.5', uk: '5.5', eu: '38.5', cm: '24.5' },
    { kor: '250', us: '8', uk: '6', eu: '39', cm: '25.0' },
    { kor: '255', us: '8.5', uk: '6.5', eu: '40', cm: '25.5' },
    { kor: '260', us: '9', uk: '7', eu: '40.5', cm: '26.0' },
    { kor: '265', us: '9.5', uk: '7.5', eu: '41', cm: '26.5' },
    { kor: '270', us: '10', uk: '8', eu: '42', cm: '27.0' },
  ];
  const measurementTips = [
    {
      title: '가슴둘레 측정법',
      description: '겨드랑이 아래 가장 볼록한 부분을 수평으로 측정',
      icon: '📏',
    },
    {
      title: '허리둘레 측정법',
      description: '허리의 가장 가는 부분을 수평으로 측정',
      icon: '📐',
    },
    {
      title: '엉덩이둘레 측정법',
      description: '엉덩이의 가장 볼록한 부분을 수평으로 측정',
      icon: '📊',
    },
    {
      title: '발 길이 측정법',
      description: '발뒤꿈치부터 가장 긴 발가락까지의 길이',
      icon: '👟',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>사이즈 가이드</h1>
        <p>정확한 사이즈 선택으로 만족스러운 쇼핑을 도와드립니다.</p>
      </div>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>카테고리</label>
          <div className={styles.filterButtons}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.filterButton} ${
                  selectedCategory === category.value ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>유형</label>
          <div className={styles.filterButtons}>
            {types.map((type) => (
              <button
                key={type.value}
                className={`${styles.filterButton} ${
                  selectedType === type.value ? styles.active : ''
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sizeTable}>
        {selectedType === 'clothing' ? (
          <div className={styles.clothingTable}>
            <h3>
              {selectedCategory === 'women' ? '여성' : selectedCategory === 'men' ? '남성' : '키즈'}{' '}
              의류 사이즈
            </h3>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div>사이즈</div>
                <div>가슴둘레 (cm)</div>
                <div>허리둘레 (cm)</div>
                <div>엉덩이둘레 (cm)</div>
                <div>{selectedCategory === 'kids' ? '권장 신장 (cm)' : '권장 신장 (cm)'}</div>
              </div>
              {(selectedCategory === 'women'
                ? womenClothingSizes
                : selectedCategory === 'men'
                  ? menClothingSizes
                  : kidsClothingSizes
              ).map((item: ClothingSize, index: number) => (
                <div key={index} className={styles.tableRow}>
                  <div className={styles.sizeLabel}>{item.size}</div>
                  <div>{item.chest}</div>
                  <div>{item.waist}</div>
                  <div>{item.hip}</div>
                  <div>{item.length}</div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedType === 'shoes' ? (
          <div className={styles.shoeTable}>
            <h3>신발 사이즈</h3>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div>한국</div>
                <div>US</div>
                <div>UK</div>
                <div>EU</div>
                <div>발 길이 (cm)</div>
              </div>
              {shoeSizes.map((item: ShoeSize, index: number) => (
                <div key={index} className={styles.tableRow}>
                  <div className={styles.sizeLabel}>{item.kor}</div>
                  <div>{item.us}</div>
                  <div>{item.uk}</div>
                  <div>{item.eu}</div>
                  <div>{item.cm}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.accessoriesTable}>
            <h3>액세서리 사이즈</h3>
            <div className={styles.infoCard}>
              <p>액세서리는 원사이즈(Free Size) 또는 조절 가능한 제품이 대부분입니다.</p>
              <ul>
                <li>목걸이: 체인 길이 조절 가능</li>
                <li>반지: 사이즈 조절 가능한 제품 위주</li>
                <li>팔찌: 조절 가능한 체인 길이</li>
                <li>모자: 머리둘레 56-58cm 기준</li>
                <li>벨트: 허리둘레에 맞게 조절 가능</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className={styles.measurementGuide}>
        <h3>측정 가이드</h3>
        <div className={styles.tipsGrid}>
          {measurementTips.map((tip, index) => (
            <div key={index} className={styles.tipCard}>
              <div className={styles.tipIcon}>{tip.icon}</div>
              <h4>{tip.title}</h4>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.additionalInfo}>
        <h3>사이즈 선택 팁</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>🎯 정확한 측정</h4>
            <p>측정 시 줄자가 너무 조이거나 느슨하지 않도록 주의하세요.</p>
          </div>
          <div className={styles.infoCard}>
            <h4>📐 몸에 맞게</h4>
            <p>속옷만 착용한 상태에서 측정하는 것이 가장 정확합니다.</p>
          </div>
          <div className={styles.infoCard}>
            <h4>📞 문의하기</h4>
            <p>사이즈 선택에 어려움이 있으시면 고객센터로 문의해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

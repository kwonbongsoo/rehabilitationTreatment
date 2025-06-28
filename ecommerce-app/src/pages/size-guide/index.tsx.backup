import Head from 'next/head';
import React, { useState } from 'react';
import styles from './SizeGuide.module.css';

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

const SizeGuide: React.FC = () => {
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
      <Head>
        <title>사이즈 가이드 - StyleShop</title>
        <meta name="description" content="StyleShop 상품의 정확한 사이즈 정보를 확인하세요." />
      </Head>
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
      </div>{' '}
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
                <li>
                  <strong>반지:</strong> 내경 기준으로 표기됩니다
                </li>
                <li>
                  <strong>목걸이:</strong> 길이별로 다양한 옵션 제공
                </li>
                <li>
                  <strong>팔찌:</strong> 조절 가능한 체인 제공
                </li>
                <li>
                  <strong>벨트:</strong> 허리둘레 + 10-15cm 여유분
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className={styles.measurementGuide}>
        <h3>올바른 측정 방법</h3>
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
        <div className={styles.infoCard}>
          <h3>📋 사이즈 선택 가이드</h3>
          <ul>
            <li>체형에 따라 사이즈가 다를 수 있으니 신중하게 선택해주세요.</li>
            <li>브랜드별로 사이즈가 다를 수 있습니다.</li>
            <li>신축성 있는 소재는 조금 작은 사이즈도 괜찮습니다.</li>
            <li>겉옷은 여유 있게 선택하시는 것을 권장합니다.</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h3>🔄 교환 정책</h3>
          <ul>
            <li>사이즈 불만족 시 7일 이내 교환 가능합니다.</li>
            <li>택과 라벨이 그대로 있어야 교환 가능합니다.</li>
            <li>착용 흔적이 있으면 교환이 어려울 수 있습니다.</li>
            <li>교환 시 배송비는 고객 부담입니다.</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h3>📞 사이즈 문의</h3>
          <p>사이즈 선택에 어려움이 있으시면 언제든 문의해주세요.</p>
          <div className={styles.contactInfo}>
            <div>
              <strong>고객센터</strong>
              <p>1588-1234 (평일 9:00-18:00)</p>
            </div>
            <div>
              <strong>온라인 문의</strong>
              <p>1:1 문의하기</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;

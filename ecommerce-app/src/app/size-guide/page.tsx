'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
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

  const getClothingSizeData = () => {
    switch (selectedCategory) {
      case 'women':
        return womenClothingSizes;
      case 'men':
        return menClothingSizes;
      case 'kids':
        return kidsClothingSizes;
      default:
        return womenClothingSizes;
    }
  };

  return (
    <Layout>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Size Guide</h1>
          <p className={styles.subtitle}>Choose the right size for perfect fit</p>
        </div>

        <div className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Category</label>
            <div className={styles.buttonGroup}>
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
            <label className={styles.label}>Type</label>
            <div className={styles.buttonGroup}>
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

        <div className={styles.sizeCard}>
          {selectedType === 'clothing' ? (
            <div>
              <h3 className={styles.sizeTitle}>
                {selectedCategory === 'women'
                  ? 'Women'
                  : selectedCategory === 'men'
                    ? 'Men'
                    : 'Kids'}{' '}
                Clothing Sizes
              </h3>
              <div className={styles.tableWrapper}>
                <div className={`${styles.sizeTable} ${styles.clothingTable}`}>
                  <div className={styles.tableHeader}>Size</div>
                  <div className={styles.tableHeader}>Chest (cm)</div>
                  <div className={styles.tableHeader}>Waist (cm)</div>
                  <div className={styles.tableHeader}>Hip (cm)</div>
                  <div className={styles.tableHeader}>Height (cm)</div>
                  {getClothingSizeData().map((item: ClothingSize, index: number) => (
                    <React.Fragment key={index}>
                      <div className={styles.tableCell}>{item.size}</div>
                      <div className={styles.tableDataCell}>{item.chest}</div>
                      <div className={styles.tableDataCell}>{item.waist}</div>
                      <div className={styles.tableDataCell}>{item.hip}</div>
                      <div className={styles.tableDataCell}>{item.length}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedType === 'shoes' ? (
            <div>
              <h3 className={styles.sizeTitle}>Shoe Sizes</h3>
              <div className={styles.tableWrapper}>
                <div className={`${styles.sizeTable} ${styles.shoeTable}`}>
                  <div className={styles.tableHeader}>KOR</div>
                  <div className={styles.tableHeader}>US</div>
                  <div className={styles.tableHeader}>UK</div>
                  <div className={styles.tableHeader}>EU</div>
                  <div className={styles.tableHeader}>Length (cm)</div>
                  {shoeSizes.map((item: ShoeSize, index: number) => (
                    <React.Fragment key={index}>
                      <div className={styles.tableCell}>{item.kor}</div>
                      <div className={styles.tableDataCell}>{item.us}</div>
                      <div className={styles.tableDataCell}>{item.uk}</div>
                      <div className={styles.tableDataCell}>{item.eu}</div>
                      <div className={styles.tableDataCell}>{item.cm}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className={styles.sizeTitle}>Accessory Sizes</h3>
              <div className={styles.accessoryInfo}>
                <p className={styles.accessoryText}>
                  Most accessories are one-size-fits-all or adjustable.
                </p>
                <ul className={styles.accessoryList}>
                  <li>Necklaces: Adjustable chain length</li>
                  <li>Rings: Mostly adjustable sizes</li>
                  <li>Bracelets: Adjustable chain length</li>
                  <li>Hats: Head circumference 56-58cm</li>
                  <li>Belts: Adjustable to waist size</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Measurement Guide</h3>
          <div className={styles.grid}>
            {measurementTips.map((tip, index) => (
              <div key={index} className={styles.tipCard}>
                <div className={styles.tipIcon}>{tip.icon}</div>
                <h4 className={styles.tipTitle}>{tip.title}</h4>
                <p className={styles.tipDescription}>{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Size Selection Tips</h3>
          <div className={styles.grid}>
            <div className={styles.tipCard}>
              <h4 className={styles.tipTitle}>🎯 Accurate Measurement</h4>
              <p className={styles.tipDescription}>Keep the tape measure snug but not tight.</p>
            </div>
            <div className={styles.tipCard}>
              <h4 className={styles.tipTitle}>📐 Proper Fit</h4>
              <p className={styles.tipDescription}>
                Measure while wearing only undergarments for accuracy.
              </p>
            </div>
            <div className={styles.tipCard}>
              <h4 className={styles.tipTitle}>📞 Get Help</h4>
              <p className={styles.tipDescription}>Contact customer service for size assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

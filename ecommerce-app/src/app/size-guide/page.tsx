'use client';

import React, { useState } from 'react';

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
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>Size Guide</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Choose the right size for perfect fit</p>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>Category</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <button
                key={category.value}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  background: selectedCategory === category.value ? '#007bff' : 'transparent',
                  color: selectedCategory === category.value ? 'white' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>Type</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {types.map((type) => (
              <button
                key={type.value}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  background: selectedType === type.value ? '#007bff' : 'transparent',
                  color: selectedType === type.value ? 'white' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '20px' }}>
        {selectedType === 'clothing' ? (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
              {selectedCategory === 'women' ? 'Women' : selectedCategory === 'men' ? 'Men' : 'Kids'} Clothing Sizes
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', minWidth: '500px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>Size</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>Chest (cm)</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>Waist (cm)</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>Hip (cm)</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>Height (cm)</div>
                {getClothingSizeData().map((item: ClothingSize, index: number) => (
                  <React.Fragment key={index}>
                    <div style={{ fontSize: '14px', color: '#333', padding: '8px', fontWeight: '500' }}>{item.size}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.chest}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.waist}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.hip}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.length}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : selectedType === 'shoes' ? (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Shoe Sizes</h3>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', minWidth: '400px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>KOR</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>US</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>UK</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>EU</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', padding: '8px', background: '#f8f9fa' }}>Length (cm)</div>
                {shoeSizes.map((item: ShoeSize, index: number) => (
                  <React.Fragment key={index}>
                    <div style={{ fontSize: '14px', color: '#333', padding: '8px', fontWeight: '500' }}>{item.kor}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.us}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.uk}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.eu}</div>
                    <div style={{ fontSize: '14px', color: '#666', padding: '8px' }}>{item.cm}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Accessory Sizes</h3>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>Most accessories are one-size-fits-all or adjustable.</p>
              <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '0', paddingLeft: '20px' }}>
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

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', textAlign: 'center' }}>Measurement Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {measurementTips.map((tip, index) => (
            <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{tip.icon}</div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>{tip.title}</h4>
              <p style={{ fontSize: '12px', color: '#666', margin: '0', lineHeight: '1.4' }}>{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', textAlign: 'center' }}>Size Selection Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>🎯 Accurate Measurement</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0', lineHeight: '1.4' }}>Keep the tape measure snug but not tight.</p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>📐 Proper Fit</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0', lineHeight: '1.4' }}>Measure while wearing only undergarments for accuracy.</p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>📞 Get Help</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0', lineHeight: '1.4' }}>Contact customer service for size assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

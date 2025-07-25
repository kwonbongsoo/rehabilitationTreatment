'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './page.module.css';

export default function FilterPage() {
  const router = useRouter();

  // 필터 상태
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');
  const [selectedRating, setSelectedRating] = useState(4);
  const [priceRange, setPriceRange] = useState([10, 50]);

  const brands = ['All', 'Nike', 'Adidas', 'Puma'];
  const genders = ['All', 'Men', 'Women'];
  const sortOptions = ['Most Recent', 'Popular', 'Price High'];
  const ratings = [1, 2, 3, 4, 5];

  const handleBackClick = () => {
    router.back();
  };

  const handleResetFilter = () => {
    setSelectedBrand('All');
    setSelectedGender('All');
    setSelectedSort('Popular');
    setSelectedRating(4);
    setPriceRange([10, 50]);
  };

  const handleApply = () => {
    router.back();
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    const index = parseInt(event.target.dataset.index || '0');
    const newRange = [...priceRange];

    if (index === 0) {
      // 최소값 조정 - 최대값보다 클 수 없음
      newRange[0] = Math.min(value, priceRange[1]! - 1);
    } else {
      // 최대값 조정 - 최소값보다 작을 수 없음
      newRange[1] = Math.max(value, priceRange[0]! + 1);
    }

    setPriceRange(newRange);
  };

  const handleSliderInteraction = (clientX: number, rect: DOMRect) => {
    const clickPosition = (clientX - rect.left) / rect.width;
    const clickValue = Math.round(10 + Math.max(0, Math.min(1, clickPosition)) * 90); // 10-100 범위, 경계값 처리

    // 클릭 위치가 어느 슬라이더에 더 가까운지 판단
    const distanceToMin = Math.abs(clickValue - priceRange[0]!);
    const distanceToMax = Math.abs(clickValue - priceRange[1]!);

    const newRange = [...priceRange];
    if (distanceToMin < distanceToMax) {
      // 최소값 슬라이더에 더 가까움
      newRange[0] = Math.min(clickValue, priceRange[1]! - 1);
    } else {
      // 최대값 슬라이더에 더 가까움
      newRange[1] = Math.max(clickValue, priceRange[0]! + 1);
    }

    setPriceRange(newRange);
  };

  const handleSliderMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    handleSliderInteraction(event.clientX, rect);
  };

  const handleSliderTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];
    handleSliderInteraction(touch?.clientX || 0, rect);
  };

  return (
    <div className={styles.filterPage}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <FiArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Filter</h1>
        <div></div>
      </header>

      <div className={styles.content}>
        {/* Brands */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Brands</h2>
          <div className={styles.buttonGroup}>
            {brands.map((brand) => (
              <button
                key={brand}
                className={`${styles.filterButton} ${selectedBrand === brand ? styles.active : ''}`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        {/* Gender */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Gender</h2>
          <div className={styles.buttonGroup}>
            {genders.map((gender) => (
              <button
                key={gender}
                className={`${styles.filterButton} ${
                  selectedGender === gender ? styles.active : ''
                }`}
                onClick={() => setSelectedGender(gender)}
              >
                {gender}
              </button>
            ))}
          </div>
        </section>

        {/* Sort by */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sort by</h2>
          <div className={styles.buttonGroup}>
            {sortOptions.map((option) => (
              <button
                key={option}
                className={`${styles.filterButton} ${selectedSort === option ? styles.active : ''}`}
                onClick={() => setSelectedSort(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {/* Rating */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Rating</h2>
          <div className={styles.buttonGroup}>
            {ratings.map((rating) => (
              <button
                key={rating}
                className={`${styles.ratingButton} ${
                  selectedRating === rating ? styles.active : ''
                }`}
                onClick={() => setSelectedRating(rating)}
              >
                {rating} ★
              </button>
            ))}
          </div>
        </section>

        {/* Price Range */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Price Range</h2>
          <div className={styles.priceRangeContainer}>
            <div className={styles.priceInputs}>
              <div className={styles.priceInput}>
                <span className={styles.priceLabel}>${priceRange[0]}</span>
              </div>
              <div className={styles.priceInput}>
                <span className={styles.priceLabel}>${priceRange[1]}</span>
              </div>
            </div>
            <div
              className={styles.sliderContainer}
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderTouchStart}
            >
              <div
                className={styles.sliderTrack}
                style={{
                  left: `${((priceRange[0]! - 10) / 90) * 100}%`,
                  width: `${((priceRange[1]! - priceRange[0]!) / 90) * 100}%`,
                }}
              />
              <input
                type="range"
                min="10"
                max="100"
                value={priceRange[0]}
                data-index="0"
                onChange={handlePriceChange}
                className={`${styles.slider} ${styles.sliderMin}`}
                style={{ zIndex: priceRange[0]! > priceRange[1]! - 5 ? 5 : 3 }}
              />
              <input
                type="range"
                min="10"
                max="100"
                value={priceRange[1]}
                data-index="1"
                onChange={handlePriceChange}
                className={`${styles.slider} ${styles.sliderMax}`}
                style={{ zIndex: priceRange[1]! < priceRange[0]! + 5 ? 5 : 4 }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* 하단 버튼들 */}
      <div className={styles.bottomActions}>
        <button className={styles.resetButton} onClick={handleResetFilter}>
          Reset Filter
        </button>
        <button className={styles.applyButton} onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
}

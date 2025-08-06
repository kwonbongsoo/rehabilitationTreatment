'use client';
import Link from 'next/link';
import styles from './CategoryIconGrid.module.css';
import React, { useRef, useState } from 'react';
import { Category } from '@/domains/category/types/categories';

interface CategoryIconGridProps {
  categories: Category[];
  showHeader?: boolean;
  headerTitle?: string;
  seeAllLink?: string;
  seeAllText?: string;
  selectedCategoryId?: number | null;
  onCategoryClick?: (categoryId: number) => void;
  disableNavigation?: boolean;
}

export default function CategoryIconGrid({
  categories,
  showHeader = false,
  headerTitle = 'Category',
  seeAllLink = '/categories',
  seeAllText = 'see all',
  selectedCategoryId = null,
  onCategoryClick,
  disableNavigation = false,
}: CategoryIconGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (categories.length === 0) return null;

  const handleCategoryClick = (category: Category, e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    if (disableNavigation && onCategoryClick) {
      e.preventDefault();
      onCategoryClick(category.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current || !e.touches[0]) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current || !e.touches[0]) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section className={styles.categorySection}>
      {showHeader && (
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{headerTitle}</h2>
          <Link href={seeAllLink} className={styles.seeAllLink}>
            {seeAllText}
          </Link>
        </div>
      )}
      <div className={styles.categoriesWrapper}>
        <div
          className={styles.categories}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {categories.map((category) => {
            const icon = category.iconCode;
            const href = disableNavigation ? '#' : category.link;
            const isSelected = selectedCategoryId === category.id;

            const categoryElement = (
              <div
                className={`${styles.category} ${isSelected ? styles.selected : ''}`}
                onClick={(e) => handleCategoryClick(category, e)}
              >
                <div className={styles.categoryIconContainer}>
                  <span className={styles.categoryIcon}>{icon}</span>
                </div>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            );

            if (disableNavigation) {
              return <div key={category.id}>{categoryElement}</div>;
            }

            return (
              <Link href={href} key={category.id}>
                {categoryElement}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

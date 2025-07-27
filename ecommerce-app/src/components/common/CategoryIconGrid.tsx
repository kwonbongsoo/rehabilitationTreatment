'use client';
import Link from 'next/link';
import styles from './CategoryIconGrid.module.css';
import React from 'react';

interface Category {
  id: number;
  name: string;
  icon?: string;
  iconCode?: string;
  link?: string;
  slug?: string;
}

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
  if (categories.length === 0) return null;

  const handleCategoryClick = (category: Category, e: React.MouseEvent) => {
    if (disableNavigation && onCategoryClick) {
      e.preventDefault();
      onCategoryClick(category.id);
    }
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
        <div className={styles.categories}>
          {categories.map((category) => {
            const icon = category.icon || category.iconCode || '📦';
            const href = disableNavigation
              ? '#'
              : category.link || `/categories${category.slug ? `/${category.slug}` : ''}`;
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

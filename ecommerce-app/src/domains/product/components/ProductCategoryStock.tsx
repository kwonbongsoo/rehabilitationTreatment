import React from 'react';
import styles from '@/styles/account/AddProduct.module.css';
import type { CategoryOption } from '@/domains/category/services/categoriesService';

interface ProductCategoryStockProps {
  formData: {
    categoryId: number;
    stock: number;
    sku?: string;
  };
  errors: { [key: string]: string };
  categories: CategoryOption[];
  loadingCategories: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function ProductCategoryStock({ 
  formData, 
  errors, 
  categories, 
  loadingCategories, 
  onChange 
}: ProductCategoryStockProps) {
  return (
    <div className={styles.section}>
      <label className={styles.sectionTitle}>Category & Brand</label>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Category *</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={onChange}
          className={`${styles.select} ${errors.categoryId ? styles.inputError : ''}`}
          required
          disabled={loadingCategories}
        >
          <option value="">
            {loadingCategories ? 'Loading categories...' : 'Select category'}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span className={styles.errorMessage}>{errors.categoryId}</span>
        )}
        {errors.categories && (
          <span className={styles.errorMessage}>{errors.categories}</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Stock Quantity (Optional)</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={onChange}
          className={`${styles.input} ${errors.stock ? styles.inputError : ''}`}
          placeholder="0"
          min="0"
        />
        {errors.stock && <span className={styles.errorMessage}>{errors.stock}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>SKU (Optional)</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={onChange}
          className={styles.input}
          placeholder="Enter SKU (optional)"
        />
      </div>
    </div>
  );
}
import React, { ReactElement } from 'react';
import styles from '@/styles/account/AddProduct.module.css';

interface ProductBasicInfoProps {
  formData: {
    name: string;
    description: string;
    price: number;
    originalPrice: number;
  };
  errors: { [key: string]: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function ProductBasicInfo({
  formData,
  errors,
  onChange,
}: ProductBasicInfoProps): ReactElement {
  return (
    <div className={styles.section}>
      <label className={styles.sectionTitle}>Basic Information</label>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Product Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Enter product name"
          required
        />
        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          placeholder="Enter product description"
          rows={4}
          required
        />
        {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Price *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={onChange}
          className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
        {errors.price && <span className={styles.errorMessage}>{errors.price}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Original Price *</label>
        <input
          type="number"
          name="originalPrice"
          value={formData.originalPrice}
          onChange={onChange}
          className={`${styles.input} ${errors.originalPrice ? styles.inputError : ''}`}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
        {errors.originalPrice && (
          <span className={styles.errorMessage}>{errors.originalPrice}</span>
        )}
      </div>
    </div>
  );
}

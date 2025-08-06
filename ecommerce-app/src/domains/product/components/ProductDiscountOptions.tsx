import React, { ReactElement } from 'react';
import styles from '@/styles/account/AddProduct.module.css';

interface ProductDiscountOptionsProps {
  formData: {
    discountPercentage: number;
    isNew: boolean;
    isFeatured: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductDiscountOptions({
  formData,
  onChange,
}: ProductDiscountOptionsProps): ReactElement {
  return (
    <div className={styles.section}>
      <label className={styles.sectionTitle}>Discount & Options (Optional)</label>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Discount Percentage (Optional)</label>
        <input
          type="number"
          name="discountPercentage"
          value={formData.discountPercentage}
          onChange={onChange}
          className={styles.input}
          placeholder="0"
          min="0"
          max="100"
        />
      </div>

      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isNew"
            checked={formData.isNew}
            onChange={onChange}
            className={styles.checkbox}
          />
          New Product
        </label>
      </div>

      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={onChange}
            className={styles.checkbox}
          />
          Featured Product
        </label>
      </div>
    </div>
  );
}

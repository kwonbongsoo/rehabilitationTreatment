import React from 'react';
import styles from '@/styles/account/AddProduct.module.css';

interface ProductDetailsProps {
  formData: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDimensionChange: (dimension: 'length' | 'width' | 'height', value: string) => void;
}

export function ProductDetails({ formData, onChange, onDimensionChange }: ProductDetailsProps) {
  return (
    <div className={styles.section}>
      <label className={styles.sectionTitle}>Product Details (Optional)</label>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Weight (kg, Optional)</label>
        <input
          type="number"
          name="weight"
          value={formData.weight}
          onChange={onChange}
          className={styles.input}
          placeholder="0.0"
          min="0"
          step="0.01"
        />
      </div>

      <div className={styles.dimensionsGroup}>
        <label className={styles.label}>Dimensions (cm, Optional)</label>
        <div className={styles.dimensionsInputs}>
          <input
            type="number"
            value={formData.dimensions?.length}
            onChange={(e) => onDimensionChange('length', e.target.value)}
            className={styles.dimensionInput}
            placeholder="Length"
            min="0"
            step="0.1"
          />
          <span className={styles.dimensionSeparator}>×</span>
          <input
            type="number"
            value={formData.dimensions?.width}
            onChange={(e) => onDimensionChange('width', e.target.value)}
            className={styles.dimensionInput}
            placeholder="Width"
            min="0"
            step="0.1"
          />
          <span className={styles.dimensionSeparator}>×</span>
          <input
            type="number"
            value={formData.dimensions?.height}
            onChange={(e) => onDimensionChange('height', e.target.value)}
            className={styles.dimensionInput}
            placeholder="Height"
            min="0"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import styles from '@/styles/account/AddProduct.module.css';

interface ProductSpecificationsProps {
  specifications: { [key: string]: string };
  onSpecificationChange: (key: string, value: string) => void;
  onAddSpecification: () => void;
  onRemoveSpecification: (key: string) => void;
  onSpecificationKeyChange: (oldKey: string, newKey: string, value: string) => void;
}

export function ProductSpecifications({
  specifications,
  onSpecificationChange,
  onAddSpecification,
  onRemoveSpecification,
  onSpecificationKeyChange,
}: ProductSpecificationsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.specHeader}>
        <label className={styles.sectionTitle}>Specifications (Optional)</label>
        <button type="button" onClick={onAddSpecification} className={styles.addSpecButton}>
          + Add
        </button>
      </div>

      <div className={styles.specificationsContainer}>
        {Object.entries(specifications || {}).map(([key, value]) => (
          <div key={key} className={styles.specificationItem}>
            <input
              type="text"
              value={key.replace('spec_', '')}
              onChange={(e) => {
                const newKey = `spec_${e.target.value}`;
                if (newKey !== key) {
                  onSpecificationKeyChange(key, newKey, value);
                }
              }}
              className={styles.specKeyInput}
              placeholder="Specification name"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onSpecificationChange(key, e.target.value)}
              className={styles.specValueInput}
              placeholder="Specification value"
            />
            <button
              type="button"
              onClick={() => onRemoveSpecification(key)}
              className={styles.removeSpecButton}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
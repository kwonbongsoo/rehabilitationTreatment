import React from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import styles from '@/styles/account/AddProduct.module.css';

interface ProductImageUploadProps {
  images: File[];
  imagePreviews: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export function ProductImageUpload({
  images,
  imagePreviews,
  onImageUpload,
  onRemoveImage,
}: ProductImageUploadProps) {
  return (
    <div className={styles.section}>
      <label className={styles.sectionTitle}>Product Images</label>
      <div className={styles.imageSection}>
        <div className={styles.imageGrid}>
          {imagePreviews.map((preview, index) => (
            <div key={index} className={styles.imagePreview}>
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={() => onRemoveImage(index)}
              >
                <FiX size={16} />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <label className={styles.imageUploadButton}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageUpload}
                style={{ display: 'none' }}
              />
              <FiCamera size={24} />
              <span>Add Photo</span>
            </label>
          )}
        </div>
        <p className={styles.imageHint}>최대 5개의 이미지를 업로드할 수 있습니다.</p>
      </div>
    </div>
  );
}
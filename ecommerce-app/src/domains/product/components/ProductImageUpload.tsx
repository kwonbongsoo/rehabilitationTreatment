import React, { ReactElement } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '@/styles/account/AddProduct.module.css';

interface CompressionProgress {
  [key: string]: number;
}

interface ProductImageUploadProps {
  images: File[];
  imagePreviews: string[];
  isCompressing?: boolean;
  compressionProgress?: CompressionProgress;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export function ProductImageUpload({
  images,
  imagePreviews,
  isCompressing = false,
  compressionProgress = {},
  onImageUpload,
  onRemoveImage,
}: ProductImageUploadProps): ReactElement {
  const hasActiveCompression = Object.keys(compressionProgress).length > 0;
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
              <span>Add Photo</span>
            </label>
          )}
        </div>
        <div className={styles.imageInfo}>
          <p className={styles.imageHint}>
            최대 5개의 이미지를 업로드할 수 있습니다. 
            (파일당 최대 10MB, 압축 후 2MB 이하)
          </p>
          
          {isCompressing && (
            <div className={styles.compressionStatus}>
              <span>이미지 압축 중...</span>
              {hasActiveCompression && (
                <div className={styles.progressIndicator}>
                  {Object.entries(compressionProgress).map(([key, progress]) => {
                    const fileName = key.split('_')[0];
                    return (
                      <div key={key} className={styles.progressItem}>
                        <span className={styles.fileName}>{fileName}</span>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>{progress}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {images.length > 0 && (
            <div className={styles.sizeInfo}>
              총 용량: {(images.reduce((total, file) => total + file.size / 1024 / 1024, 0)).toFixed(1)}MB
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

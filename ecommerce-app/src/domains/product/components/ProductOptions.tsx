import React from 'react';
import styles from '@/styles/account/AddProduct.module.css';
import type { ProductOption } from '@/domains/product/types/product';

interface ProductOptionsProps {
  options: ProductOption[];
  onOptionChange: (index: number, field: keyof ProductOption, value: string | number | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onMoveOption: (fromIndex: number, toIndex: number) => void;
}

const OPTION_TYPES = [
  { value: 'color', label: '색상' },
  { value: 'size', label: '사이즈' },
  { value: 'material', label: '소재' },
  { value: 'style', label: '스타일' },
  { value: 'pattern', label: '패턴' },
  { value: 'capacity', label: '용량' },
  { value: 'weight', label: '중량' },
  { value: 'custom', label: '기타' },
];

export function ProductOptions({
  options,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onMoveOption,
}: ProductOptionsProps) {
  const handleInputChange = (
    index: number,
    field: keyof ProductOption,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value, type } = e.target;
    
    if (type === 'checkbox') {
      onOptionChange(index, field, (e.target as HTMLInputElement).checked);
    } else if (field === 'additionalPrice' || field === 'stock' || field === 'sortOrder') {
      onOptionChange(index, field, Number(value) || 0);
    } else {
      onOptionChange(index, field, value);
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      onMoveOption(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < options.length - 1) {
      onMoveOption(index, index + 1);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.specHeader}>
        <label className={styles.sectionTitle}>Product Options (Optional)</label>
        <button type="button" onClick={onAddOption} className={styles.addSpecButton}>
          + Add Option
        </button>
      </div>

      {options.length > 0 && (
        <div className={styles.optionsContainer}>
          {options.map((option, index) => (
            <div key={index} className={styles.optionItem}>
              <div className={styles.optionHeader}>
                <span className={styles.optionIndex}>#{index + 1}</span>
                <div className={styles.optionControls}>
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={styles.moveButton}
                    title="위로 이동"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === options.length - 1}
                    className={styles.moveButton}
                    title="아래로 이동"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveOption(index)}
                    className={styles.removeSpecButton}
                    title="옵션 삭제"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className={styles.optionFields}>
                <div className={styles.optionRow}>
                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>옵션 유형 *</label>
                    <select
                      value={option.optionType}
                      onChange={(e) => handleInputChange(index, 'optionType', e)}
                      className={styles.optionSelect}
                      required
                    >
                      <option value="">선택하세요</option>
                      {OPTION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>옵션명 *</label>
                    <input
                      type="text"
                      value={option.optionName}
                      onChange={(e) => handleInputChange(index, 'optionName', e)}
                      className={styles.optionInput}
                      placeholder="예: 색상, 사이즈"
                      required
                    />
                  </div>

                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>옵션값 *</label>
                    <input
                      type="text"
                      value={option.optionValue}
                      onChange={(e) => handleInputChange(index, 'optionValue', e)}
                      className={styles.optionInput}
                      placeholder="예: 빨강, XL"
                      required
                    />
                  </div>
                </div>

                <div className={styles.optionRow}>
                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>추가 가격</label>
                    <input
                      type="number"
                      value={option.additionalPrice}
                      onChange={(e) => handleInputChange(index, 'additionalPrice', e)}
                      className={styles.optionInput}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>재고 수량 *</label>
                    <input
                      type="number"
                      value={option.stock}
                      onChange={(e) => handleInputChange(index, 'stock', e)}
                      className={styles.optionInput}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>SKU</label>
                    <input
                      type="text"
                      value={option.sku || ''}
                      onChange={(e) => handleInputChange(index, 'sku', e)}
                      className={styles.optionInput}
                      placeholder="옵션별 SKU"
                    />
                  </div>
                </div>

                <div className={styles.optionRow}>
                  <div className={styles.optionField}>
                    <label className={styles.optionLabel}>정렬 순서</label>
                    <input
                      type="number"
                      value={option.sortOrder}
                      onChange={(e) => handleInputChange(index, 'sortOrder', e)}
                      className={styles.optionInput}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className={styles.optionField}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={option.isActive}
                        onChange={(e) => handleInputChange(index, 'isActive', e)}
                        className={styles.checkbox}
                      />
                      활성 상태
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {options.length === 0 && (
        <div className={styles.emptyOptions}>
          <p>등록된 옵션이 없습니다. 색상, 사이즈 등의 옵션을 추가해보세요.</p>
        </div>
      )}
    </div>
  );
}
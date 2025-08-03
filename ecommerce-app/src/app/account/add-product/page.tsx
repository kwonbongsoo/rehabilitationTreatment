'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import styles from '@/styles/account/AddProduct.module.css';
import { createProduct } from '@/domains/product/services';
import type { ProductFormData } from '@/domains/product/types/product';
import { useAuth } from '@/domains/auth/stores/useAuthStore';
import { v4 as uuidv4 } from 'uuid';
import { fetchCategories, type CategoryOption } from '@/domains/category/services/categoriesService';

interface ProductFormWithImages extends ProductFormData {
  images: File[];
}

export default function AddProductPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProductFormWithImages>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    categoryId: 0,
    sellerId: '',
    stock: 0,
    isNew: false,
    isFeatured: false,
    discountPercentage: 0,
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // X-Idempotency-Key를 한 번 생성하고 재사용
  const idempotencyKeyRef = useRef<string>(uuidv4());

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetchCategories();
        
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          console.error('Failed to fetch categories:', response.error);
          setErrors(prev => ({
            ...prev,
            categories: response.error || 'Failed to load categories'
          }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setErrors(prev => ({
          ...prev,
          categories: 'Failed to load categories'
        }));
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case 'name':
        if (!value || typeof value !== 'string') return '상품명을 입력해주세요.';
        if (value.trim().length < 2) return '상품명은 2글자 이상 입력해주세요.';
        if (value.trim().length > 100) return '상품명은 100글자 이하로 입력해주세요.';
        break;

      case 'description':
        if (!value || typeof value !== 'string') return '상품 설명을 입력해주세요.';
        if (value.trim().length < 10) return '상품 설명은 10글자 이상 입력해주세요.';
        if (value.trim().length > 1000) return '상품 설명은 1000글자 이하로 입력해주세요.';
        break;

      case 'price':
      case 'originalPrice': {
        if (!value || typeof value !== 'string') return '가격을 입력해주세요.';
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) return '0보다 큰 숫자를 입력해주세요.';
        if (price > 10000000) return '1천만원 이하로 입력해주세요.';
        break;
      }

      case 'stock': {
        if (value && typeof value === 'string') {
          const stock = parseInt(value);
          if (isNaN(stock) || stock < 0) return '0 이상의 숫자를 입력해주세요.';
          if (stock > 999999) return '999,999개 이하로 입력해주세요.';
        }
        break;
      }

      case 'weight': {
        if (value && typeof value === 'string') {
          const weight = parseFloat(value);
          if (isNaN(weight) || weight < 0) return '0 이상의 숫자를 입력해주세요.';
          if (weight > 10000) return '10,000kg 이하로 입력해주세요.';
        }
        break;
      }

      case 'sku':
        if (value && typeof value === 'string' && value.trim().length > 50) {
          return 'SKU는 50글자 이하로 입력해주세요.';
        }
        break;

      case 'discount': {
        if (value && typeof value === 'string') {
          const discount = parseFloat(value);
          if (isNaN(discount) || discount < 0) return '0 이상의 숫자를 입력해주세요.';
        }
        break;
      }

      case 'discountPercentage': {
        if (value && typeof value === 'string') {
          const percent = parseFloat(value);
          if (isNaN(percent) || percent < 0 || percent > 100) {
            return '0~100 사이의 숫자를 입력해주세요.';
          }
        }
        break;
      }
    }
    return '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 실시간 validation
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    const key = `spec_${Date.now()}`;
    handleSpecificationChange(key, '');
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files];

    // 최대 5개까지만 허용
    if (newImages.length > 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.');
      // input value 초기화 (같은 파일 재선택 가능하도록)
      e.target.value = '';
      return;
    }

    // 이미지 미리보기 생성
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // input value 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // 기존 preview URL 해제
    const previewUrl = imagePreviews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviews(newPreviews);
  };

  const validateForm = (): string | null => {
    // 필수 필드 검증
    if (!formData.name.trim()) {
      return '상품명을 입력해주세요.';
    }
    if (formData.name.trim().length < 2) {
      return '상품명은 2글자 이상 입력해주세요.';
    }
    if (formData.name.trim().length > 100) {
      return '상품명은 100글자 이하로 입력해주세요.';
    }

    if (!formData.description.trim()) {
      return '상품 설명을 입력해주세요.';
    }
    if (formData.description.trim().length < 10) {
      return '상품 설명은 10글자 이상 입력해주세요.';
    }
    if (formData.description.trim().length > 1000) {
      return '상품 설명은 1000글자 이하로 입력해주세요.';
    }

    if (!formData.categoryId) {
      return '카테고리를 선택해주세요.';
    }

    // 가격 검증
    const price = Number(formData.price);
    const originalPrice = Number(formData.originalPrice);

    if (!formData.price || isNaN(price) || price <= 0) {
      return '올바른 판매가격을 입력해주세요. (0보다 큰 숫자)';
    }
    if (price > 10000000) {
      return '판매가격은 1천만원 이하로 입력해주세요.';
    }

    if (!formData.originalPrice || isNaN(originalPrice) || originalPrice <= 0) {
      return '올바른 원가를 입력해주세요. (0보다 큰 숫자)';
    }
    if (originalPrice > 10000000) {
      return '원가는 1천만원 이하로 입력해주세요.';
    }

    if (price > originalPrice) {
      return '판매가격은 원가보다 높을 수 없습니다.';
    }

    // 선택적 필드 검증
    if (formData.stock && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      return '재고는 0 이상의 숫자로 입력해주세요.';
    }
    if (formData.stock && Number(formData.stock) > 999999) {
      return '재고는 999,999개 이하로 입력해주세요.';
    }

    if (formData.weight) {
      const weight = Number(formData.weight);
      if (isNaN(weight) || weight < 0) {
        return '무게는 0 이상의 숫자로 입력해주세요.';
      }
      if (weight > 10000) {
        return '무게는 10,000kg 이하로 입력해주세요.';
      }
    }

    if (formData.discountPercentage) {
      const discountPercent = Number(formData.discountPercentage);
      if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        return '할인율은 0~100 사이의 숫자로 입력해주세요.';
      }
    }

    // 치수 검증
    if (formData.dimensions) {
      const { length, width, height } = formData.dimensions;
      if (length || width || height) {
        const lengthNum = Number(length);
        const widthNum = Number(width);
        const heightNum = Number(height);

        if (length && (isNaN(lengthNum) || lengthNum <= 0)) {
          return '길이는 0보다 큰 숫자로 입력해주세요.';
        }
        if (width && (isNaN(widthNum) || widthNum <= 0)) {
          return '너비는 0보다 큰 숫자로 입력해주세요.';
        }
        if (height && (isNaN(heightNum) || heightNum <= 0)) {
          return '높이는 0보다 큰 숫자로 입력해주세요.';
        }

        if (lengthNum > 10000 || widthNum > 10000 || heightNum > 10000) {
          return '치수는 각각 10,000cm 이하로 입력해주세요.';
        }
      }
    }

    // SKU 검증
    if (formData.sku && formData.sku.trim().length > 50) {
      return 'SKU는 50글자 이하로 입력해주세요.';
    }

    // 이미지 검증
    if (formData.images.length === 0) {
      return '최소 1개의 상품 이미지를 업로드해주세요.';
    }

    // 사양 검증
    if (formData.specifications) {
      const specs = Object.entries(formData.specifications);
      for (const [key, value] of specs) {
        const specName = key.replace('spec_', '').trim();
        if (!specName) {
          return '사양 이름을 입력해주세요.';
        }
        if (!value.trim()) {
          return `"${specName}" 사양의 값을 입력해주세요.`;
        }
        if (specName.length > 50) {
          return '사양 이름은 50글자 이하로 입력해주세요.';
        }
        if (value.length > 200) {
          return '사양 값은 200글자 이하로 입력해주세요.';
        }
      }
    }

    return null; // 검증 통과
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 폼 데이터 검증
      const validationError = validateForm();
      if (validationError) {
        alert(validationError);
        setIsSubmitting(false);
        return;
      }

      // 사용자 인증 확인
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        setIsSubmitting(false);
        return;
      }

      // FormData 생성
      const formDataToSend = new FormData();

      // 현재 상태의 데이터 추가
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('originalPrice', formData.originalPrice.toString());
      formDataToSend.append('categoryId', formData.categoryId.toString());
      formDataToSend.append('sellerId', user.id);
      if (formData.stock) formDataToSend.append('stock', formData.stock.toString());
      if (formData.sku) formDataToSend.append('sku', formData.sku);
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString());

      if (formData.dimensions?.length)
        formDataToSend.append('dimensions.length', formData.dimensions.length.toString());
      if (formData.dimensions?.width)
        formDataToSend.append('dimensions.width', formData.dimensions.width.toString());
      if (formData.dimensions?.height)
        formDataToSend.append('dimensions.height', formData.dimensions.height.toString());

      formDataToSend.append('isNew', formData.isNew.toString());
      formDataToSend.append('isFeatured', formData.isFeatured.toString());

      if (formData.discountPercentage)
        formDataToSend.append('discountPercentage', formData.discountPercentage.toString());

      // specifications 추가
      Object.entries(formData.specifications || {}).forEach(([key, value]) => {
        if (value.trim()) {
          formDataToSend.append(key, value);
        }
      });

      // 이미지 파일들 추가
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // X-Idempotency-Key 추가
      formDataToSend.append('idempotencyKey', idempotencyKeyRef.current);

      // Server Action 호출
      const result = await createProduct(formDataToSend);

      if (!result.success) {
        if (result.errors) {
          // 특정 필드 에러 표시
          setErrors(result.errors);
        } else {
          alert(result.message || '상품 등록에 실패했습니다.');
        }
        setIsSubmitting(false);
        return;
      }

      // 성공 시 새로운 idempotency key 생성 (다음 요청을 위해)
      idempotencyKeyRef.current = uuidv4();
      // 성공 시 리다이렉트는 createProduct에서 처리됨
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.addProductContainer}>
      {/* 폼 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 이미지 업로드 섹션 */}
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
                    onClick={() => removeImage(index)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}

              {formData.images.length < 5 && (
                <label className={styles.imageUploadButton}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
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

        {/* 기본 정보 */}
        <div className={styles.section}>
          <label className={styles.sectionTitle}>Basic Information</label>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Enter product description"
              rows={4}
              required
            />
            {errors.description && (
              <span className={styles.errorMessage}>{errors.description}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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

        {/* 카테고리 및 브랜드 */}
        <div className={styles.section}>
          <label className={styles.sectionTitle}>Category & Brand</label>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter SKU (optional)"
            />
          </div>
        </div>

        {/* 할인 및 특별 옵션 */}
        <div className={styles.section}>
          <label className={styles.sectionTitle}>Discount & Options (Optional)</label>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Discount Percentage (Optional)</label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              Featured Product
            </label>
          </div>
        </div>

        {/* 상품 상세 정보 */}
        <div className={styles.section}>
          <label className={styles.sectionTitle}>Product Details (Optional)</label>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Weight (kg, Optional)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
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
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                className={styles.dimensionInput}
                placeholder="Length"
                min="0"
                step="0.1"
              />
              <span className={styles.dimensionSeparator}>×</span>
              <input
                type="number"
                value={formData.dimensions?.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className={styles.dimensionInput}
                placeholder="Width"
                min="0"
                step="0.1"
              />
              <span className={styles.dimensionSeparator}>×</span>
              <input
                type="number"
                value={formData.dimensions?.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className={styles.dimensionInput}
                placeholder="Height"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* 사양 정보 */}
        <div className={styles.section}>
          <div className={styles.specHeader}>
            <label className={styles.sectionTitle}>Specifications (Optional)</label>
            <button type="button" onClick={addSpecification} className={styles.addSpecButton}>
              + Add Specification
            </button>
          </div>

          <div className={styles.specificationsContainer}>
            {Object.entries(formData.specifications || {}).map(([key, value]) => (
              <div key={key} className={styles.specificationItem}>
                <input
                  type="text"
                  value={key.replace('spec_', '')}
                  onChange={(e) => {
                    const newKey = `spec_${e.target.value}`;
                    if (newKey !== key) {
                      const newSpecs = { ...formData.specifications };
                      delete newSpecs[key];
                      newSpecs[newKey] = value;
                      setFormData((prev) => ({
                        ...prev,
                        specifications: newSpecs,
                      }));
                    }
                  }}
                  className={styles.specKeyInput}
                  placeholder="Specification name"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleSpecificationChange(key, e.target.value)}
                  className={styles.specValueInput}
                  placeholder="Specification value"
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className={styles.removeSpecButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className={styles.submitSection}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

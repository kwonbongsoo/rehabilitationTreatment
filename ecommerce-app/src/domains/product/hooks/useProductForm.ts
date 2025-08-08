import React, { useCallback } from 'react';
import { useProductFormData } from './useProductFormData';
import { useProductImages } from './useProductImages';
import { useProductOptions } from './useProductOptions';
import { useProductSpecifications } from './useProductSpecifications';
import { useProductCategories } from './useProductCategories';
import { useProductSubmission } from './useProductSubmission';
import { ProductFormData, ProductOption } from '..';
import { Category } from '@/types';

interface CompressionProgress {
  [key: string]: number;
}

export function useProductForm(): {
  formData: ProductFormData;
  imagePreviews: string[];
  isSubmitting: boolean;
  isCompressing: boolean;
  compressionProgress: CompressionProgress;
  errors: { [key: string]: string };
  categories: Category[];
  loadingCategories: boolean;
  handlers: {
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDimensionChange: (dimension: 'length' | 'width' | 'height', value: string) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
    handleSpecificationChange: (key: string, value: string) => void;
    addSpecification: (key: string, value: string) => void;
    removeSpecification: (key: string) => void;
    handleSpecificationKeyChange: (oldKey: string, newKey: string, value: string) => void;
    handleOptionChange: (
      index: number,
      field: keyof ProductOption,
      value: string | number | boolean,
    ) => void;
    addOption: () => void;
    removeOption: (index: number) => void;
    moveOption: (fromIndex: number, toIndex: number) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
  };
} {
  // 각 기능별 훅 사용
  const {
    formData,
    errors,
    handleInputChange,
    handleDimensionChange,
    resetFormData,
    setFieldError,
  } = useProductFormData();

  const { 
    images, 
    imagePreviews, 
    isCompressing, 
    compressionProgress, 
    handleImageUpload, 
    removeImage, 
    resetImages 
  } = useProductImages();

  const { options, handleOptionChange, addOption, removeOption, moveOption, resetOptions } =
    useProductOptions();

  const {
    specifications,
    handleSpecificationChange,
    addSpecification,
    removeSpecification,
    resetSpecifications,
  } = useProductSpecifications();

  const { categories, loadingCategories, categoriesError } = useProductCategories();

  const { isSubmitting, handleSubmit: submitProduct } = useProductSubmission();

  // 통합 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // 카테고리 에러가 있으면 일반 에러에 추가
        if (categoriesError) {
          setFieldError('categories', categoriesError);
        }

        // 모든 데이터를 통합하여 제출
        await submitProduct({
          ...formData,
          images,
          options,
          specifications,
        });

        // 성공 시 모든 폼 초기화
        resetFormData();
        resetImages();
        resetOptions();
        resetSpecifications();
      } catch (error) {
        // 에러가 JSON 형태의 필드 에러인 경우 처리
        if (error instanceof Error && error.message.startsWith('{')) {
          try {
            const fieldErrors = JSON.parse(error.message);
            Object.entries(fieldErrors).forEach(([field, message]) => {
              setFieldError(field, String(message));
            });
          } catch {
            // JSON 파싱 실패시 일반 에러로 처리
            console.error('Form submission error:', error);
          }
        }
      }
    },
    [
      formData,
      images,
      options,
      specifications,
      categoriesError,
      submitProduct,
      resetFormData,
      resetImages,
      resetOptions,
      resetSpecifications,
      setFieldError,
    ],
  );

  // 사양 키 변경 핸들러 (페이지에서 사용)
  const handleSpecificationKeyChange = useCallback(
    (oldKey: string, newKey: string, value: string) => {
      if (newKey !== oldKey) {
        removeSpecification(oldKey);
        handleSpecificationChange(newKey, value);
      }
    },
    [removeSpecification, handleSpecificationChange],
  );

  return {
    // 폼 데이터
    formData: {
      ...formData,
      images,
      options,
      specifications,
    },

    // 상태
    imagePreviews,
    isSubmitting,
    isCompressing,
    compressionProgress,
    errors: {
      ...errors,
      ...(categoriesError && { categories: categoriesError }),
    },
    categories,
    loadingCategories,

    // 핸들러들
    handlers: {
      // 기본 필드
      handleInputChange,
      handleDimensionChange,

      // 이미지
      handleImageUpload,
      removeImage,

      // 사양
      handleSpecificationChange,
      addSpecification,
      removeSpecification,
      handleSpecificationKeyChange,

      // 옵션
      handleOptionChange,
      addOption,
      removeOption,
      moveOption,

      // 제출
      handleSubmit,
    },
  };
}

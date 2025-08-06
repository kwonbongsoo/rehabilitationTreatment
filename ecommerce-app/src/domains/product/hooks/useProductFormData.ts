import React, { useState, useCallback } from 'react';
import { validateField } from '@/domains/product/utils/productValidation';
import type { ProductFormData } from '@/domains/product/types/product';

interface UseProductFormDataReturn {
  formData: ProductFormData;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleDimensionChange: (dimension: 'length' | 'width' | 'height', value: string) => void;
  updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
  resetFormData: () => void;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
}

const initialFormData: ProductFormData = {
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
};

export function useProductFormData(): UseProductFormDataReturn {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // 실시간 validation (체크박스는 제외)
    if (type !== 'checkbox') {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, []);

  const handleDimensionChange = useCallback((
    dimension: 'length' | 'width' | 'height', 
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  }, []);

  const updateField = useCallback(<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    formData,
    errors,
    handleInputChange,
    handleDimensionChange,
    updateField,
    resetFormData,
    clearErrors,
    setFieldError,
  };
}
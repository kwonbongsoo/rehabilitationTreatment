/**
 * useProductForm 훅 테스트
 *
 * 상품 등록 폼의 통합 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 모든 의존성을 모킹합니다.
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useProductForm } from '../useProductForm';

// 의존성 모킹
jest.mock('../useProductFormData', () => ({
  useProductFormData: jest.fn(() => ({
    formData: {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      stock: '',
      weight: '',
      sku: '',
      discountPercentage: '',
      dimensions: { length: '', width: '', height: '' },
    },
    errors: {},
    handleInputChange: jest.fn(),
    handleDimensionChange: jest.fn(),
    resetFormData: jest.fn(),
    setFieldError: jest.fn(),
  })),
}));

jest.mock('../useProductImages', () => ({
  useProductImages: jest.fn(() => ({
    images: [],
    imagePreviews: [],
    handleImageUpload: jest.fn(),
    removeImage: jest.fn(),
    resetImages: jest.fn(),
  })),
}));

jest.mock('../useProductOptions', () => ({
  useProductOptions: jest.fn(() => ({
    options: [],
    handleOptionChange: jest.fn(),
    addOption: jest.fn(),
    removeOption: jest.fn(),
    moveOption: jest.fn(),
    resetOptions: jest.fn(),
  })),
}));

jest.mock('../useProductSpecifications', () => ({
  useProductSpecifications: jest.fn(() => ({
    specifications: {},
    handleSpecificationChange: jest.fn(),
    addSpecification: jest.fn(),
    removeSpecification: jest.fn(),
    resetSpecifications: jest.fn(),
  })),
}));

jest.mock('../useProductCategories', () => ({
  useProductCategories: jest.fn(() => ({
    categories: [],
    loadingCategories: false,
    categoriesError: null,
  })),
}));

jest.mock('../useProductSubmission', () => ({
  useProductSubmission: jest.fn(() => ({
    isSubmitting: false,
    handleSubmit: jest.fn(),
  })),
}));

describe('useProductForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('모든 기본값이 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductForm());

      expect(result.current.formData).toEqual({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        categoryId: '',
        stock: '',
        weight: '',
        sku: '',
        discountPercentage: '',
        dimensions: { length: '', width: '', height: '' },
        images: [],
        options: [],
        specifications: {},
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.imagePreviews).toEqual([]);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.loadingCategories).toBe(false);
    });

    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useProductForm());

      expect(result.current.handlers).toHaveProperty('handleInputChange');
      expect(result.current.handlers).toHaveProperty('handleDimensionChange');
      expect(result.current.handlers).toHaveProperty('handleImageUpload');
      expect(result.current.handlers).toHaveProperty('removeImage');
      expect(result.current.handlers).toHaveProperty('handleSpecificationChange');
      expect(result.current.handlers).toHaveProperty('addSpecification');
      expect(result.current.handlers).toHaveProperty('removeSpecification');
      expect(result.current.handlers).toHaveProperty('handleSpecificationKeyChange');
      expect(result.current.handlers).toHaveProperty('handleOptionChange');
      expect(result.current.handlers).toHaveProperty('addOption');
      expect(result.current.handlers).toHaveProperty('removeOption');
      expect(result.current.handlers).toHaveProperty('moveOption');
      expect(result.current.handlers).toHaveProperty('handleSubmit');
    });
  });

  describe('폼 제출', () => {
    it('성공적인 제출 시 모든 폼이 초기화되어야 한다', async () => {
      const mockResetFormData = jest.fn();
      const mockResetImages = jest.fn();
      const mockResetOptions = jest.fn();
      const mockResetSpecifications = jest.fn();
      const mockSubmitProduct = jest.fn().mockResolvedValue({});

      // 의존성 모킹 업데이트
      require('../useProductFormData').useProductFormData.mockReturnValue({
        formData: { name: 'Test Product' },
        errors: {},
        handleInputChange: jest.fn(),
        handleDimensionChange: jest.fn(),
        resetFormData: mockResetFormData,
        setFieldError: jest.fn(),
      });

      require('../useProductImages').useProductImages.mockReturnValue({
        images: [new File([''], 'test.jpg')],
        imagePreviews: [],
        handleImageUpload: jest.fn(),
        removeImage: jest.fn(),
        resetImages: mockResetImages,
      });

      require('../useProductOptions').useProductOptions.mockReturnValue({
        options: [{ optionType: 'color', optionValue: 'red' }],
        handleOptionChange: jest.fn(),
        addOption: jest.fn(),
        removeOption: jest.fn(),
        moveOption: jest.fn(),
        resetOptions: mockResetOptions,
      });

      require('../useProductSpecifications').useProductSpecifications.mockReturnValue({
        specifications: { material: 'cotton' },
        handleSpecificationChange: jest.fn(),
        addSpecification: jest.fn(),
        removeSpecification: jest.fn(),
        resetSpecifications: mockResetSpecifications,
      });

      require('../useProductSubmission').useProductSubmission.mockReturnValue({
        isSubmitting: false,
        handleSubmit: mockSubmitProduct,
      });

      const { result } = renderHook(() => useProductForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handlers.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSubmitProduct).toHaveBeenCalledWith({
        name: 'Test Product',
        images: [expect.any(File)],
        options: [{ optionType: 'color', optionValue: 'red' }],
        specifications: { material: 'cotton' },
      });

      expect(mockResetFormData).toHaveBeenCalled();
      expect(mockResetImages).toHaveBeenCalled();
      expect(mockResetOptions).toHaveBeenCalled();
      expect(mockResetSpecifications).toHaveBeenCalled();
    });

    it('제출 실패 시 에러가 처리되어야 한다', async () => {
      const mockSetFieldError = jest.fn();
      const mockSubmitProduct = jest
        .fn()
        .mockRejectedValue(
          new Error('{"name": "상품명이 필요합니다.", "price": "가격이 필요합니다."}'),
        );

      // 의존성 모킹 업데이트
      require('../useProductFormData').useProductFormData.mockReturnValue({
        formData: {},
        errors: {},
        handleInputChange: jest.fn(),
        handleDimensionChange: jest.fn(),
        resetFormData: jest.fn(),
        setFieldError: mockSetFieldError,
      });

      require('../useProductSubmission').useProductSubmission.mockReturnValue({
        isSubmitting: false,
        handleSubmit: mockSubmitProduct,
      });

      const { result } = renderHook(() => useProductForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handlers.handleSubmit(mockEvent);
      });

      expect(mockSetFieldError).toHaveBeenCalledWith('name', '상품명이 필요합니다.');
      expect(mockSetFieldError).toHaveBeenCalledWith('price', '가격이 필요합니다.');
    });

    it('카테고리 에러가 있을 때 에러가 설정되어야 한다', async () => {
      const mockSetFieldError = jest.fn();
      const mockSubmitProduct = jest.fn().mockResolvedValue({});

      // 의존성 모킹 업데이트 - 카테고리 에러 포함
      require('../useProductCategories').useProductCategories.mockReturnValue({
        categories: [],
        loadingCategories: false,
        categoriesError: '카테고리를 불러올 수 없습니다.',
      });

      require('../useProductFormData').useProductFormData.mockReturnValue({
        formData: {},
        errors: {},
        handleInputChange: jest.fn(),
        handleDimensionChange: jest.fn(),
        resetFormData: jest.fn(),
        setFieldError: mockSetFieldError,
      });

      require('../useProductSubmission').useProductSubmission.mockReturnValue({
        isSubmitting: false,
        handleSubmit: mockSubmitProduct,
      });

      const { result } = renderHook(() => useProductForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handlers.handleSubmit(mockEvent);
      });

      expect(mockSetFieldError).toHaveBeenCalledWith(
        'categories',
        '카테고리를 불러올 수 없습니다.',
      );
    });
  });

  describe('사양 키 변경', () => {
    it('사양 키가 변경될 때 기존 키는 제거되고 새 키가 추가되어야 한다', () => {
      const mockRemoveSpecification = jest.fn();
      const mockHandleSpecificationChange = jest.fn();

      require('../useProductSpecifications').useProductSpecifications.mockReturnValue({
        specifications: {},
        handleSpecificationChange: mockHandleSpecificationChange,
        addSpecification: jest.fn(),
        removeSpecification: mockRemoveSpecification,
        resetSpecifications: jest.fn(),
      });

      const { result } = renderHook(() => useProductForm());

      act(() => {
        result.current.handlers.handleSpecificationKeyChange('oldKey', 'newKey', 'value');
      });

      expect(mockRemoveSpecification).toHaveBeenCalledWith('oldKey');
      expect(mockHandleSpecificationChange).toHaveBeenCalledWith('newKey', 'value');
    });

    it('사양 키가 동일할 때는 아무 작업도 하지 않아야 한다', () => {
      const mockRemoveSpecification = jest.fn();
      const mockHandleSpecificationChange = jest.fn();

      require('../useProductSpecifications').useProductSpecifications.mockReturnValue({
        specifications: {},
        handleSpecificationChange: mockHandleSpecificationChange,
        addSpecification: jest.fn(),
        removeSpecification: mockRemoveSpecification,
        resetSpecifications: jest.fn(),
      });

      const { result } = renderHook(() => useProductForm());

      act(() => {
        result.current.handlers.handleSpecificationKeyChange('sameKey', 'sameKey', 'value');
      });

      expect(mockRemoveSpecification).not.toHaveBeenCalled();
      expect(mockHandleSpecificationChange).not.toHaveBeenCalled();
    });
  });

  describe('에러 통합', () => {
    it('카테고리 에러가 에러 객체에 포함되어야 한다', () => {
      require('../useProductCategories').useProductCategories.mockReturnValue({
        categories: [],
        loadingCategories: false,
        categoriesError: '카테고리 로딩 실패',
      });

      require('../useProductFormData').useProductFormData.mockReturnValue({
        formData: {},
        errors: { name: '상품명 오류' },
        handleInputChange: jest.fn(),
        handleDimensionChange: jest.fn(),
        resetFormData: jest.fn(),
        setFieldError: jest.fn(),
      });

      const { result } = renderHook(() => useProductForm());

      expect(result.current.errors).toEqual({
        name: '상품명 오류',
        categories: '카테고리 로딩 실패',
      });
    });
  });
});

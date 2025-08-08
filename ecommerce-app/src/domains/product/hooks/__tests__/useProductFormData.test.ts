/**
 * useProductFormData 훅 테스트
 *
 * 상품 폼 데이터 관리의 핵심 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 모든 의존성을 모킹합니다.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useProductFormData } from '../useProductFormData';

// validateField 모킹 - 실제 검증 로직을 모킹하여 사이드이펙트 방지
jest.mock('@/domains/product/utils/productValidation', () => ({
  validateField: jest.fn((name: string, value: string) => {
    // 테스트용 간단한 검증 로직
    if (name === 'name' && !value.trim()) return '상품명을 입력해주세요.';
    if (name === 'price' && Number(value) <= 0) return '가격은 0보다 커야 합니다.';
    return ''; // 에러 없음
  }),
}));

describe('useProductFormData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('모든 기본값이 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      expect(result.current.formData).toEqual({
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
      });

      expect(result.current.errors).toEqual({});
    });

    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      expect(typeof result.current.handleInputChange).toBe('function');
      expect(typeof result.current.handleDimensionChange).toBe('function');
      expect(typeof result.current.updateField).toBe('function');
      expect(typeof result.current.resetFormData).toBe('function');
      expect(typeof result.current.clearErrors).toBe('function');
      expect(typeof result.current.setFieldError).toBe('function');
    });
  });

  describe('입력 변경 처리', () => {
    it('텍스트 입력이 올바르게 처리되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      const mockEvent = {
        target: {
          name: 'name',
          value: '테스트 상품',
          type: 'text',
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputChange(mockEvent);
      });

      expect(result.current.formData.name).toBe('테스트 상품');
    });

    it('숫자 입력이 올바르게 처리되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      const mockEvent = {
        target: {
          name: 'price',
          value: '10000',
          type: 'number',
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputChange(mockEvent);
      });

      expect(result.current.formData.price).toBe(10000);
    });

    it('빈 숫자 입력은 0으로 처리되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      const mockEvent = {
        target: {
          name: 'price',
          value: '',
          type: 'number',
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputChange(mockEvent);
      });

      expect(result.current.formData.price).toBe(0);
    });

    it('체크박스 입력이 올바르게 처리되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      const mockEvent = {
        target: {
          name: 'isNew',
          value: 'on',
          type: 'checkbox',
          checked: true,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputChange(mockEvent);
      });

      expect(result.current.formData.isNew).toBe(true);
    });

    it('실시간 검증이 텍스트 입력에서 실행되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());
      const { validateField } = require('@/domains/product/utils/productValidation');

      const mockEvent = {
        target: {
          name: 'name',
          value: '',
          type: 'text',
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputChange(mockEvent);
      });

      expect(validateField).toHaveBeenCalledWith('name', '');
      expect(result.current.errors.name).toBe('상품명을 입력해주세요.');
    });

    it('체크박스는 실시간 검증에서 제외되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());
      const { validateField } = require('@/domains/product/utils/productValidation');

      const mockEvent = {
        target: {
          name: 'isNew',
          value: 'on',
          type: 'checkbox',
          checked: true,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputChange(mockEvent);
      });

      expect(validateField).not.toHaveBeenCalled();
      expect(result.current.errors).toEqual({});
    });
  });

  describe('치수 변경 처리', () => {
    it('치수가 올바르게 업데이트되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.handleDimensionChange('length', '10');
      });

      expect(result.current.formData.dimensions?.length).toBe('10');
    });

    it('기존 치수가 유지되면서 특정 치수만 업데이트되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.handleDimensionChange('length', '10');
        result.current.handleDimensionChange('width', '20');
      });

      expect(result.current.formData.dimensions).toEqual({
        length: '10',
        width: '20',
      });
    });
  });

  describe('필드 업데이트', () => {
    it('updateField가 특정 필드를 올바르게 업데이트해야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.updateField('name', '업데이트된 상품명');
      });

      expect(result.current.formData.name).toBe('업데이트된 상품명');
    });

    it('updateField가 숫자 필드를 올바르게 업데이트해야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.updateField('price', 25000);
      });

      expect(result.current.formData.price).toBe(25000);
    });

    it('updateField가 불린 필드를 올바르게 업데이트해야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.updateField('isFeatured', true);
      });

      expect(result.current.formData.isFeatured).toBe(true);
    });
  });

  describe('폼 초기화', () => {
    it('resetFormData가 모든 데이터를 초기 상태로 되돌려야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      // 먼저 데이터 변경
      act(() => {
        result.current.updateField('name', '테스트 상품');
        result.current.updateField('price', 10000);
        result.current.setFieldError('name', '테스트 에러');
      });

      // 초기화 실행
      act(() => {
        result.current.resetFormData();
      });

      expect(result.current.formData).toEqual({
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
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('에러 관리', () => {
    it('setFieldError가 특정 필드 에러를 설정해야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.setFieldError('name', '상품명이 너무 짧습니다.');
      });

      expect(result.current.errors.name).toBe('상품명이 너무 짧습니다.');
    });

    it('여러 필드 에러가 독립적으로 관리되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.setFieldError('name', '상품명 에러');
        result.current.setFieldError('price', '가격 에러');
      });

      expect(result.current.errors).toEqual({
        name: '상품명 에러',
        price: '가격 에러',
      });
    });

    it('clearErrors가 모든 에러를 제거해야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      // 먼저 에러 설정
      act(() => {
        result.current.setFieldError('name', '상품명 에러');
        result.current.setFieldError('price', '가격 에러');
      });

      // 에러 클리어
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });

    it('기존 에러가 있는 상태에서 새 에러 추가시 기존 에러는 유지되어야 한다', () => {
      const { result } = renderHook(() => useProductFormData());

      act(() => {
        result.current.setFieldError('name', '기존 에러');
        result.current.setFieldError('price', '새 에러');
      });

      expect(result.current.errors.name).toBe('기존 에러');
      expect(result.current.errors.price).toBe('새 에러');
    });
  });

  describe('메모리 및 성능', () => {
    it('핸들러 함수들이 리렌더링에서 안정적이어야 한다', () => {
      const { result, rerender } = renderHook(() => useProductFormData());

      const firstRenderHandlers = {
        handleInputChange: result.current.handleInputChange,
        handleDimensionChange: result.current.handleDimensionChange,
        updateField: result.current.updateField,
        resetFormData: result.current.resetFormData,
        clearErrors: result.current.clearErrors,
        setFieldError: result.current.setFieldError,
      };

      rerender();

      expect(result.current.handleInputChange).toBe(firstRenderHandlers.handleInputChange);
      expect(result.current.handleDimensionChange).toBe(firstRenderHandlers.handleDimensionChange);
      expect(result.current.updateField).toBe(firstRenderHandlers.updateField);
      expect(result.current.resetFormData).toBe(firstRenderHandlers.resetFormData);
      expect(result.current.clearErrors).toBe(firstRenderHandlers.clearErrors);
      expect(result.current.setFieldError).toBe(firstRenderHandlers.setFieldError);
    });
  });
});

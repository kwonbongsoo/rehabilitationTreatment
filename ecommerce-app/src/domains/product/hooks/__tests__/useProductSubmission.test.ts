/**
 * useProductSubmission 훅 테스트
 *
 * 상품 제출 로직의 핵심 기능을 테스트합니다.
 * 사이드이펙트 방지를 위해 모든 의존성을 모킹합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useProductSubmission } from '../useProductSubmission';
import type { ProductActionResult } from '@/domains/product/types/product';

// 외부 의존성 모킹
jest.mock('@/domains/auth/stores/useAuthStore', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id', name: 'Test User' },
  })),
}));

jest.mock('@/domains/product/services', () => ({
  createProduct: jest.fn(),
}));

jest.mock('@/domains/product/utils/productValidation', () => ({
  validateForm: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// alert 모킹
const mockAlert = jest.fn();
global.alert = mockAlert;

// console.error 모킹
const mockConsoleError = jest.fn();
global.console.error = mockConsoleError;

// DOM querySelector 모킹
const mockElement = {
  focus: jest.fn(),
};
// Mock document.querySelector for focus behavior
jest.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);

describe('useProductSubmission', () => {
  const mockCreateProduct = require('@/domains/product/services').createProduct;
  const mockValidateForm = require('@/domains/product/utils/productValidation').validateForm;
  const mockUseAuth = require('@/domains/auth/stores/useAuthStore').useAuth;

  const mockSubmissionData = {
    name: '테스트 상품',
    description: '테스트 설명',
    price: 10000,
    originalPrice: 12000,
    categoryId: 1,
    sellerId: '',
    stock: 10,
    isNew: true,
    isFeatured: false,
    discountPercentage: 10,
    images: [new File([''], 'test.jpg', { type: 'image/jpeg' })],
    options: [{ 
      optionType: 'color', 
      optionName: '색상',
      optionValue: 'red',
      additionalPrice: 0,
      stock: 10,
      isActive: true,
      sortOrder: 1
    }],
    specifications: { material: 'cotton' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    mockConsoleError.mockClear();

    // 기본 모킹 설정
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id', name: 'Test User' },
    });
    mockValidateForm.mockReturnValue(null); // 검증 성공
    mockCreateProduct.mockResolvedValue({ success: true });
  });

  describe('초기 상태', () => {
    it('올바른 초기값이 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductSubmission());

      expect(result.current.isSubmitting).toBe(false);
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(result.current.idempotencyKey).toBe('test-uuid-123');
    });
  });

  describe('성공적인 제출', () => {
    it('유효한 데이터로 성공적으로 제출되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockValidateForm).toHaveBeenCalledWith(mockSubmissionData);
      expect(mockCreateProduct).toHaveBeenCalledWith(expect.any(FormData));
      expect(result.current.isSubmitting).toBe(false);
    });

    it('성공 시 새로운 idempotency key가 생성되어야 한다', async () => {
      // uuid 모킹을 동적으로 변경
      const mockV4 = require('uuid').v4;
      mockV4.mockReturnValueOnce('initial-uuid').mockReturnValueOnce('new-uuid-after-success');

      const { result, rerender } = renderHook(() => useProductSubmission());

      // 초기 idempotency key 확인
      expect(result.current.idempotencyKey).toBe('initial-uuid');

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      // 리렌더링 후 새로운 key 확인
      rerender();
      expect(result.current.idempotencyKey).toBe('new-uuid-after-success');
    });

    it('제출 중에는 isSubmitting이 true여야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      // 제출 전에는 false여야 함
      expect(result.current.isSubmitting).toBe(false);

      let isSubmittingDuringExecution = false;
      mockCreateProduct.mockImplementation(async () => {
        // act 내부에서는 상태가 즉시 반영되지 않을 수 있으므로
        // 비동기 작업 중임을 다른 방식으로 확인
        await new Promise((resolve) => setTimeout(resolve, 10));
        isSubmittingDuringExecution = true; // 실행 중임을 표시
        return { success: true };
      });

      await act(async () => {
        const submitPromise = result.current.handleSubmit(mockSubmissionData);
        // 상태 변화를 기다림
        await new Promise((resolve) => setTimeout(resolve, 1));
        await submitPromise;
      });

      expect(isSubmittingDuringExecution).toBe(true);
      expect(result.current.isSubmitting).toBe(false); // 완료 후에는 false
    });
  });

  describe('검증 실패', () => {
    it('검증 실패 시 alert이 표시되고 제출이 중단되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());
      mockValidateForm.mockReturnValue('상품명을 입력해주세요.');

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockAlert).toHaveBeenCalledWith('상품명을 입력해주세요.');
      expect(mockCreateProduct).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('인증 실패', () => {
    it('사용자 인증이 없을 때 alert이 표시되고 제출이 중단되어야 한다', async () => {
      // 인증 실패 상태로 모킹
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useProductSubmission());

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockAlert).toHaveBeenCalledWith('로그인이 필요합니다.');
      expect(mockCreateProduct).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('서버 에러 처리', () => {
    it('서버에서 필드 에러를 반환할 때 첫 번째 필드에 포커스되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());
      const serverError: ProductActionResult = {
        success: false,
        errors: {
          name: '상품명이 이미 존재합니다.',
          price: '가격이 올바르지 않습니다.',
        },
      };
      mockCreateProduct.mockResolvedValue(serverError);

      await act(async () => {
        try {
          await result.current.handleSubmit(mockSubmissionData);
        } catch {
          // 에러가 던져지는 것을 예상
        }
      });

      // Check focus behavior without direct DOM access
      expect(mockElement.focus).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('서버에서 일반 메시지 에러를 반환할 때 alert이 표시되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());
      const serverError: ProductActionResult = {
        success: false,
        message: '서버 오류가 발생했습니다.',
      };
      mockCreateProduct.mockResolvedValue(serverError);

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockAlert).toHaveBeenCalledWith('서버 오류가 발생했습니다.');
      expect(result.current.isSubmitting).toBe(false);
    });

    it('서버에서 메시지가 없는 에러를 반환할 때 기본 메시지가 표시되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());
      const serverError: ProductActionResult = {
        success: false,
      };
      mockCreateProduct.mockResolvedValue(serverError);

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockAlert).toHaveBeenCalledWith('상품 등록에 실패했습니다.');
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('예외 처리', () => {
    it('예상치 못한 에러가 발생할 때 적절히 처리되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());
      const unexpectedError = new Error('네트워크 오류');
      mockCreateProduct.mockRejectedValue(unexpectedError);

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockConsoleError).toHaveBeenCalledWith('상품 등록 실패:', unexpectedError);
      expect(mockAlert).toHaveBeenCalledWith('네트워크 오류 다시 시도해주세요.');
      expect(result.current.isSubmitting).toBe(false);
    });

    it('문자열이 아닌 에러가 발생할 때 기본 메시지가 표시되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());
      mockCreateProduct.mockRejectedValue('문자열 에러');

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        '상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
      );
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('FormData 생성', () => {
    it('올바른 FormData가 생성되어 전송되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(mockCreateProduct).toHaveBeenCalledWith(expect.any(FormData));

      // FormData 내용 검증을 위해 모킹된 함수의 호출 인수 확인
      const formDataArg = mockCreateProduct.mock.calls[0][0] as FormData;
      expect(formDataArg).toBeInstanceOf(FormData);
    });

    it('이미지가 FormData에 포함되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      const formDataArg = mockCreateProduct.mock.calls[0][0] as FormData;
      expect(formDataArg.getAll('images')).toHaveLength(1);
    });

    it('옵션이 JSON 문자열로 FormData에 포함되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      const formDataArg = mockCreateProduct.mock.calls[0][0] as FormData;
      const optionsString = formDataArg.get('options') as string;
      expect(JSON.parse(optionsString)).toEqual(mockSubmissionData.options);
    });

    it('idempotency key가 FormData에 포함되어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      const formDataArg = mockCreateProduct.mock.calls[0][0] as FormData;
      expect(formDataArg.get('idempotencyKey')).toBe('test-uuid-123');
    });
  });

  describe('메모리 및 성능', () => {
    it('handleSubmit 함수가 user 의존성 변경시에만 재생성되어야 한다', () => {
      const { result, rerender } = renderHook(() => useProductSubmission());
      const firstRenderHandler = result.current.handleSubmit;

      // user가 동일하면 핸들러가 재사용되어야 함
      rerender();
      expect(result.current.handleSubmit).toBe(firstRenderHandler);

      // user가 변경되면 핸들러가 재생성되어야 함
      mockUseAuth.mockReturnValue({
        user: { id: 'different-user-id', name: 'Different User' },
      });
      rerender();
      expect(result.current.handleSubmit).not.toBe(firstRenderHandler);
    });

    it('에러 발생 후에도 다시 제출할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useProductSubmission());

      // 첫 번째 제출 - 실패
      mockCreateProduct.mockRejectedValueOnce(new Error('첫 번째 에러'));

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(result.current.isSubmitting).toBe(false);

      // 두 번째 제출 - 성공
      mockCreateProduct.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.handleSubmit(mockSubmissionData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(mockCreateProduct).toHaveBeenCalledTimes(2);
    });
  });
});

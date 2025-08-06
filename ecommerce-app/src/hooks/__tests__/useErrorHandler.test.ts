/**
 * useErrorHandler 훅 테스트
 *
 * 에러 처리 로직을 테스트합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { BaseError, AuthenticationError, ValidationError, NotFoundError } from '@ecommerce/common';

// useErrorStore 모킹
const mockSetGlobalError = jest.fn();
const mockClearGlobalError = jest.fn();
const mockAddToastError = jest.fn();
const mockSetHandlingError = jest.fn();
const mockHasErrors = jest.fn();
const mockGetErrorCount = jest.fn();

jest.mock('../../store/useErrorStore', () => ({
  useErrorStore: () => ({
    setGlobalError: mockSetGlobalError,
    clearGlobalError: mockClearGlobalError,
    addToastError: mockAddToastError,
    setHandlingError: mockSetHandlingError,
    hasErrors: mockHasErrors,
    getErrorCount: mockGetErrorCount,
  }),
}));

// console.error 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('초기화', () => {
    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(typeof result.current.handleError).toBe('function');
      expect(typeof result.current.handleApiError).toBe('function');
      expect(typeof result.current.handleSuccess).toBe('function');
      expect(typeof result.current.clearErrors).toBe('function');
      expect(typeof result.current.hasErrors).toBe('function');
      expect(typeof result.current.getErrorCount).toBe('function');
    });

    it('store에서 함수들을 올바르게 가져와야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(result.current.hasErrors).toBe(mockHasErrors);
      expect(result.current.getErrorCount).toBe(mockGetErrorCount);
    });
  });

  describe('handleError', () => {
    it('AuthenticationError를 올바르게 처리해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const authError = new AuthenticationError('인증 실패');

      act(() => {
        result.current.handleError(authError);
      });

      expect(mockConsoleError).toHaveBeenCalledWith('Error occurred:', authError);
      expect(mockSetHandlingError).toHaveBeenCalledWith(true);
      expect(mockSetGlobalError).toHaveBeenCalledWith(authError);
      expect(mockAddToastError).toHaveBeenCalledWith('인증 실패', 'error');
    });

    it('ValidationError를 올바르게 처리해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const validationError = new ValidationError('유효성 검사 실패');

      act(() => {
        result.current.handleError(validationError);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(validationError);
      expect(mockAddToastError).toHaveBeenCalledWith('유효성 검사 실패', 'warning');
    });

    it('NotFoundError를 올바르게 처리해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const notFoundError = new NotFoundError('리소스를 찾을 수 없습니다');

      act(() => {
        result.current.handleError(notFoundError);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(notFoundError);
      expect(mockAddToastError).toHaveBeenCalledWith('리소스를 찾을 수 없습니다', 'info');
    });

    it('일반 BaseError를 올바르게 처리해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const baseError = new BaseError('GENERIC_ERROR', '기본 에러');

      act(() => {
        result.current.handleError(baseError);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(baseError);
      expect(mockAddToastError).toHaveBeenCalledWith('기본 에러', 'error');
    });

    it('일반 Error를 올바르게 처리해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('일반 에러');

      act(() => {
        result.current.handleError(error);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(error);
      expect(mockAddToastError).toHaveBeenCalledWith('일반 에러', 'error');
    });

    it('알 수 없는 에러를 올바르게 처리해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const unknownError = 'string error';

      act(() => {
        result.current.handleError(unknownError);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '알 수 없는 오류가 발생했습니다',
        }),
      );
      expect(mockAddToastError).toHaveBeenCalledWith('알 수 없는 오류가 발생했습니다', 'error');
    });

    it('에러 처리 후 100ms 후에 핸들링 상태를 false로 설정해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('테스트 에러');

      act(() => {
        result.current.handleError(error);
      });

      expect(mockSetHandlingError).toHaveBeenCalledWith(true);

      // 100ms 경과
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockSetHandlingError).toHaveBeenCalledWith(false);
    });
  });

  describe('handleApiError', () => {
    it('BaseError를 handleError로 위임해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const baseError = new BaseError('API_ERROR', 'API 에러');

      act(() => {
        result.current.handleApiError(baseError);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(baseError);
      expect(mockAddToastError).toHaveBeenCalledWith('API 에러', 'error');
    });

    it('일반 Error를 handleError로 위임해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('일반 API 에러');

      act(() => {
        result.current.handleApiError(error);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(error);
      expect(mockAddToastError).toHaveBeenCalledWith('일반 API 에러', 'error');
    });

    it('알 수 없는 에러를 적절한 메시지로 변환해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const unknownError = { status: 500 };

      act(() => {
        result.current.handleApiError(unknownError);
      });

      expect(mockSetGlobalError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'API 요청 중 오류가 발생했습니다',
        }),
      );
      expect(mockAddToastError).toHaveBeenCalledWith('API 요청 중 오류가 발생했습니다', 'error');
    });
  });

  describe('handleSuccess', () => {
    it('성공 메시지를 토스트로 표시해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());
      const successMessage = '성공적으로 처리되었습니다';

      act(() => {
        result.current.handleSuccess(successMessage);
      });

      expect(mockAddToastError).toHaveBeenCalledWith(successMessage, 'success');
    });
  });

  describe('clearErrors', () => {
    it('전역 에러를 클리어해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.clearErrors();
      });

      expect(mockClearGlobalError).toHaveBeenCalled();
    });
  });

  describe('메모이제이션', () => {
    it('핸들러 함수들이 적절히 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() => useErrorHandler());

      const initialHandlers = {
        handleError: result.current.handleError,
        handleApiError: result.current.handleApiError,
        handleSuccess: result.current.handleSuccess,
        clearErrors: result.current.clearErrors,
      };

      // 리렌더링 후에도 함수가 동일해야 함
      rerender();

      expect(result.current.handleError).toBe(initialHandlers.handleError);
      expect(result.current.handleApiError).toBe(initialHandlers.handleApiError);
      expect(result.current.handleSuccess).toBe(initialHandlers.handleSuccess);
      expect(result.current.clearErrors).toBe(initialHandlers.clearErrors);
    });
  });

  describe('에러 타입별 토스트 타입', () => {
    it('각 에러 타입이 올바른 토스트 타입을 사용해야 한다', () => {
      const { result } = renderHook(() => useErrorHandler());

      const testCases = [
        { error: new AuthenticationError('인증 오류'), expectedType: 'error' },
        { error: new ValidationError('검증 오류'), expectedType: 'warning' },
        { error: new NotFoundError('404 오류'), expectedType: 'info' },
        { error: new BaseError('GENERIC_ERROR', '기본 오류'), expectedType: 'error' },
        { error: new Error('일반 오류'), expectedType: 'error' },
      ];

      testCases.forEach(({ error, expectedType }) => {
        mockAddToastError.mockClear();

        act(() => {
          result.current.handleError(error);
        });

        expect(mockAddToastError).toHaveBeenCalledWith(error.message, expectedType);
      });
    });
  });
});
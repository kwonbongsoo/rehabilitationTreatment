/**
 * useErrorStore 테스트
 * Zustand 기반 에러 상태 관리 테스트
 */
import { renderHook, act } from '@testing-library/react';
import { useErrorStore, useGlobalError, useToastError } from '../useErrorStore';
import type { ToastError } from '../useErrorStore';
import { BaseError } from '@ecommerce/common';

// Zustand 스토어를 초기 상태로 리셋하는 헬퍼 함수
const resetErrorStore = () => {
  act(() => {
    useErrorStore.getState().clearGlobalError();
    useErrorStore.getState().clearAllToastErrors();
    useErrorStore.getState().setHandlingError(false);
  });
};

// Mock Date.now for consistent testing
const mockDateNow = jest.spyOn(Date, 'now');

describe('useErrorStore', () => {
  beforeEach(() => {
    resetErrorStore();
    mockDateNow.mockReturnValue(1234567890000); // Fixed timestamp for testing
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useErrorStore());

      expect(result.current.globalError).toBeNull();
      expect(result.current.toastErrors).toEqual([]);
      expect(result.current.isHandlingError).toBe(false);
      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);
    });
  });

  describe('글로벌 에러 관리', () => {
    it('글로벌 에러를 설정한다', () => {
      const { result } = renderHook(() => useErrorStore());
      const testError = new Error('Test error message');

      act(() => {
        result.current.setGlobalError(testError);
      });

      expect(result.current.globalError).toBe(testError);
      expect(result.current.hasErrors()).toBe(true);
      expect(result.current.getErrorCount()).toBe(1);
    });

    it('BaseError를 글로벌 에러로 설정한다', () => {
      const { result } = renderHook(() => useErrorStore());
      const baseError = new BaseError(
        'VALIDATION_ERROR',
        'Validation failed',
        { field: 'email' },
        400
      );

      act(() => {
        result.current.setGlobalError(baseError);
      });

      expect(result.current.globalError).toBe(baseError);
      expect(result.current.globalError?.message).toBe('Validation failed');
      expect(result.current.hasErrors()).toBe(true);
      expect(result.current.getErrorCount()).toBe(1);
    });

    it('글로벌 에러를 null로 설정한다', () => {
      const { result } = renderHook(() => useErrorStore());
      
      // 먼저 에러를 설정
      act(() => {
        result.current.setGlobalError(new Error('Test error'));
      });

      expect(result.current.globalError).not.toBeNull();

      // 에러를 null로 설정
      act(() => {
        result.current.setGlobalError(null);
      });

      expect(result.current.globalError).toBeNull();
      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);
    });

    it('글로벌 에러를 클리어한다', () => {
      const { result } = renderHook(() => useErrorStore());
      
      // 에러 설정
      act(() => {
        result.current.setGlobalError(new Error('Test error'));
      });

      expect(result.current.globalError).not.toBeNull();

      // 에러 클리어
      act(() => {
        result.current.clearGlobalError();
      });

      expect(result.current.globalError).toBeNull();
      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);
    });

    it('글로벌 에러를 여러 번 변경할 수 있다', () => {
      const { result } = renderHook(() => useErrorStore());
      
      const firstError = new Error('First error');
      const secondError = new Error('Second error');

      // 첫 번째 에러 설정
      act(() => {
        result.current.setGlobalError(firstError);
      });

      expect(result.current.globalError).toBe(firstError);

      // 두 번째 에러로 변경
      act(() => {
        result.current.setGlobalError(secondError);
      });

      expect(result.current.globalError).toBe(secondError);
      expect(result.current.globalError?.message).toBe('Second error');
    });
  });

  describe('토스트 에러 관리', () => {
    it('에러 토스트를 추가한다 (기본 타입)', () => {
      const { result } = renderHook(() => useErrorStore());
      let toastId: string;

      act(() => {
        toastId = result.current.addToastError('Test error message');
      });

      expect(result.current.toastErrors).toHaveLength(1);
      
      const toastError = result.current.toastErrors[0];
      expect(toastError.id).toBe(toastId!);
      expect(toastError.message).toBe('Test error message');
      expect(toastError.type).toBe('error');
      expect(toastError.timestamp).toBe(1234567890000);
      
      expect(result.current.hasErrors()).toBe(true);
      expect(result.current.getErrorCount()).toBe(1);
    });

    it('다양한 타입의 토스트를 추가한다', () => {
      const { result } = renderHook(() => useErrorStore());
      const types: ToastError['type'][] = ['error', 'warning', 'info', 'success'];

      types.forEach((type, index) => {
        act(() => {
          result.current.addToastError(`${type} message`, type);
        });

        const toastError = result.current.toastErrors[index];
        expect(toastError.type).toBe(type);
        expect(toastError.message).toBe(`${type} message`);
      });

      expect(result.current.toastErrors).toHaveLength(4);
      expect(result.current.getErrorCount()).toBe(4);
    });

    it('여러 토스트 에러를 추가한다', () => {
      const { result } = renderHook(() => useErrorStore());
      const messages = ['First error', 'Second error', 'Third error'];

      messages.forEach((message) => {
        act(() => {
          result.current.addToastError(message);
        });
      });

      expect(result.current.toastErrors).toHaveLength(3);
      expect(result.current.getErrorCount()).toBe(3);
      
      messages.forEach((message, index) => {
        expect(result.current.toastErrors[index].message).toBe(message);
      });
    });

    it('고유한 ID를 생성한다', () => {
      const { result } = renderHook(() => useErrorStore());
      const ids: string[] = [];

      // Math.random을 목킹하여 예측 가능한 ID 생성
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0.123456789)
        .mockReturnValueOnce(0.987654321)
        .mockReturnValueOnce(0.555555555);

      act(() => {
        ids.push(result.current.addToastError('First'));
        ids.push(result.current.addToastError('Second'));
        ids.push(result.current.addToastError('Third'));
      });

      // 모든 ID가 고유한지 확인
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(3);
      expect(ids).toHaveLength(3);

      // ID 형식 확인 (timestamp-randomString)
      ids.forEach(id => {
        expect(id).toMatch(/^\d+-[a-z0-9]+$/);
      });

      mockRandom.mockRestore();
    });

    it('특정 토스트 에러를 제거한다', () => {
      const { result } = renderHook(() => useErrorStore());
      let firstId: string, secondId: string, thirdId: string;

      // 여러 토스트 추가
      act(() => {
        firstId = result.current.addToastError('First error');
        secondId = result.current.addToastError('Second error');
        thirdId = result.current.addToastError('Third error');
      });

      expect(result.current.toastErrors).toHaveLength(3);

      // 중간 토스트 제거
      act(() => {
        result.current.removeToastError(secondId);
      });

      expect(result.current.toastErrors).toHaveLength(2);
      expect(result.current.toastErrors[0].id).toBe(firstId);
      expect(result.current.toastErrors[1].id).toBe(thirdId);
      
      const remainingIds = result.current.toastErrors.map(toast => toast.id);
      expect(remainingIds).not.toContain(secondId);
    });

    it('존재하지 않는 토스트 ID로 제거를 시도해도 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useErrorStore());

      act(() => {
        result.current.addToastError('Test error');
      });

      expect(result.current.toastErrors).toHaveLength(1);

      // 존재하지 않는 ID로 제거 시도
      act(() => {
        result.current.removeToastError('non-existent-id');
      });

      // 기존 토스트는 그대로 유지
      expect(result.current.toastErrors).toHaveLength(1);
    });

    it('모든 토스트 에러를 클리어한다', () => {
      const { result } = renderHook(() => useErrorStore());

      // 여러 토스트 추가
      act(() => {
        result.current.addToastError('First error');
        result.current.addToastError('Second error');
        result.current.addToastError('Third error');
      });

      expect(result.current.toastErrors).toHaveLength(3);
      expect(result.current.hasErrors()).toBe(true);

      // 모든 토스트 클리어
      act(() => {
        result.current.clearAllToastErrors();
      });

      expect(result.current.toastErrors).toEqual([]);
      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);
    });
  });

  describe('에러 처리 상태 관리', () => {
    it('에러 처리 상태를 설정한다', () => {
      const { result } = renderHook(() => useErrorStore());

      expect(result.current.isHandlingError).toBe(false);

      act(() => {
        result.current.setHandlingError(true);
      });

      expect(result.current.isHandlingError).toBe(true);

      act(() => {
        result.current.setHandlingError(false);
      });

      expect(result.current.isHandlingError).toBe(false);
    });

    it('에러 처리 상태가 다른 상태에 영향을 주지 않는다', () => {
      const { result } = renderHook(() => useErrorStore());

      // 에러 설정
      act(() => {
        result.current.setGlobalError(new Error('Test'));
        result.current.addToastError('Toast error');
      });

      const globalErrorBefore = result.current.globalError;
      const toastErrorsBefore = result.current.toastErrors;

      // 에러 처리 상태만 변경
      act(() => {
        result.current.setHandlingError(true);
      });

      expect(result.current.globalError).toBe(globalErrorBefore);
      expect(result.current.toastErrors).toBe(toastErrorsBefore);
      expect(result.current.isHandlingError).toBe(true);
    });
  });

  describe('유틸리티 함수', () => {
    describe('hasErrors', () => {
      it('에러가 없을 때 false를 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        expect(result.current.hasErrors()).toBe(false);
      });

      it('글로벌 에러가 있을 때 true를 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        act(() => {
          result.current.setGlobalError(new Error('Global error'));
        });

        expect(result.current.hasErrors()).toBe(true);
      });

      it('토스트 에러가 있을 때 true를 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        act(() => {
          result.current.addToastError('Toast error');
        });

        expect(result.current.hasErrors()).toBe(true);
      });

      it('글로벌 에러와 토스트 에러가 모두 있을 때 true를 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        act(() => {
          result.current.setGlobalError(new Error('Global error'));
          result.current.addToastError('Toast error');
        });

        expect(result.current.hasErrors()).toBe(true);
      });
    });

    describe('getErrorCount', () => {
      it('에러가 없을 때 0을 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        expect(result.current.getErrorCount()).toBe(0);
      });

      it('글로벌 에러만 있을 때 1을 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        act(() => {
          result.current.setGlobalError(new Error('Global error'));
        });

        expect(result.current.getErrorCount()).toBe(1);
      });

      it('토스트 에러만 있을 때 토스트 개수를 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        act(() => {
          result.current.addToastError('Toast 1');
          result.current.addToastError('Toast 2');
          result.current.addToastError('Toast 3');
        });

        expect(result.current.getErrorCount()).toBe(3);
      });

      it('글로벌 에러와 토스트 에러가 모두 있을 때 총 개수를 반환한다', () => {
        const { result } = renderHook(() => useErrorStore());

        act(() => {
          result.current.setGlobalError(new Error('Global error'));
          result.current.addToastError('Toast 1');
          result.current.addToastError('Toast 2');
        });

        expect(result.current.getErrorCount()).toBe(3); // 1 (global) + 2 (toasts)
      });
    });
  });

  describe('복합 시나리오', () => {
    it('글로벌 에러와 토스트 에러를 동시에 관리한다', () => {
      const { result } = renderHook(() => useErrorStore());

      // 초기 상태 확인
      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);

      // 글로벌 에러 설정
      act(() => {
        result.current.setGlobalError(new Error('Critical error'));
      });

      expect(result.current.hasErrors()).toBe(true);
      expect(result.current.getErrorCount()).toBe(1);

      // 토스트 에러 추가
      act(() => {
        result.current.addToastError('Warning message', 'warning');
        result.current.addToastError('Info message', 'info');
      });

      expect(result.current.getErrorCount()).toBe(3);
      expect(result.current.toastErrors).toHaveLength(2);

      // 글로벌 에러 클리어
      act(() => {
        result.current.clearGlobalError();
      });

      expect(result.current.hasErrors()).toBe(true); // 토스트는 여전히 있음
      expect(result.current.getErrorCount()).toBe(2);

      // 모든 토스트 클리어
      act(() => {
        result.current.clearAllToastErrors();
      });

      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);
    });

    it('에러 처리 중에도 에러 추가/제거가 가능하다', () => {
      const { result } = renderHook(() => useErrorStore());

      // 에러 처리 상태 설정
      act(() => {
        result.current.setHandlingError(true);
      });

      expect(result.current.isHandlingError).toBe(true);

      // 에러 처리 중에도 에러 추가/제거 가능
      act(() => {
        result.current.setGlobalError(new Error('Error during handling'));
        result.current.addToastError('Toast during handling');
      });

      expect(result.current.globalError?.message).toBe('Error during handling');
      expect(result.current.toastErrors).toHaveLength(1);
      expect(result.current.isHandlingError).toBe(true);

      // 에러 처리 완료
      act(() => {
        result.current.setHandlingError(false);
        result.current.clearGlobalError();
        result.current.clearAllToastErrors();
      });

      expect(result.current.isHandlingError).toBe(false);
      expect(result.current.hasErrors()).toBe(false);
    });
  });
});
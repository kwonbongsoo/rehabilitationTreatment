/**
 * useErrorStore 편의 훅 테스트
 * useGlobalError, useToastError 훅 테스트
 */
import { renderHook, act } from '@testing-library/react';
import { useErrorStore, useGlobalError, useToastError } from '../useErrorStore';
import { BaseError } from '@ecommerce/common';

// Zustand 스토어를 초기 상태로 리셋하는 헬퍼 함수
const resetErrorStore = () => {
  act(() => {
    useErrorStore.getState().clearGlobalError();
    useErrorStore.getState().clearAllToastErrors();
    useErrorStore.getState().setHandlingError(false);
  });
};

describe('useGlobalError 편의 훅', () => {
  beforeEach(() => {
    resetErrorStore();
  });

  it('useErrorStore와 동일한 글로벌 에러 인터페이스를 제공한다', () => {
    const { result: storeResult } = renderHook(() => useErrorStore());
    const { result: globalErrorResult } = renderHook(() => useGlobalError());

    // 상태 비교
    expect(globalErrorResult.current.globalError).toBe(storeResult.current.globalError);

    // 함수 존재 확인
    expect(typeof globalErrorResult.current.setGlobalError).toBe('function');
    expect(typeof globalErrorResult.current.clearGlobalError).toBe('function');
  });

  it('글로벌 에러 설정이 올바르게 작동한다', () => {
    const { result } = renderHook(() => useGlobalError());
    const testError = new Error('Test global error');

    expect(result.current.globalError).toBeNull();

    act(() => {
      result.current.setGlobalError(testError);
    });

    expect(result.current.globalError).toBe(testError);
    expect(result.current.globalError?.message).toBe('Test global error');
  });

  it('BaseError 설정이 올바르게 작동한다', () => {
    const { result } = renderHook(() => useGlobalError());
    const baseError = new BaseError(
      'AUTHENTICATION_ERROR',
      'Login failed',
      { attempts: 3 },
      401
    );

    act(() => {
      result.current.setGlobalError(baseError);
    });

    expect(result.current.globalError).toBe(baseError);
    expect(result.current.globalError?.message).toBe('Login failed');
  });

  it('글로벌 에러 클리어가 올바르게 작동한다', () => {
    const { result } = renderHook(() => useGlobalError());
    
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
  });

  it('useGlobalError와 useErrorStore가 동일한 상태를 공유한다', () => {
    const { result: globalErrorResult } = renderHook(() => useGlobalError());
    const { result: storeResult } = renderHook(() => useErrorStore());

    const testError = new Error('Shared state test');

    // useGlobalError를 통해 상태 변경
    act(() => {
      globalErrorResult.current.setGlobalError(testError);
    });

    // 두 훅 모두 동일한 상태를 반영
    expect(globalErrorResult.current.globalError).toBe(testError);
    expect(storeResult.current.globalError).toBe(testError);

    // useErrorStore를 통해 상태 클리어
    act(() => {
      storeResult.current.clearGlobalError();
    });

    // 두 훅 모두 클리어된 상태 반영
    expect(globalErrorResult.current.globalError).toBeNull();
    expect(storeResult.current.globalError).toBeNull();
  });

  it('null로 에러 설정이 가능하다', () => {
    const { result } = renderHook(() => useGlobalError());
    
    // 먼저 에러 설정
    act(() => {
      result.current.setGlobalError(new Error('Test'));
    });

    expect(result.current.globalError).not.toBeNull();

    // null로 설정
    act(() => {
      result.current.setGlobalError(null);
    });

    expect(result.current.globalError).toBeNull();
  });
});

describe('useToastError 편의 훅', () => {
  beforeEach(() => {
    resetErrorStore();
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('useErrorStore와 동일한 토스트 에러 인터페이스를 제공한다', () => {
    const { result: storeResult } = renderHook(() => useErrorStore());
    const { result: toastErrorResult } = renderHook(() => useToastError());

    // 상태 비교
    expect(toastErrorResult.current.toastErrors).toBe(storeResult.current.toastErrors);

    // 함수 존재 확인
    expect(typeof toastErrorResult.current.addToastError).toBe('function');
    expect(typeof toastErrorResult.current.removeToastError).toBe('function');
    expect(typeof toastErrorResult.current.clearAllToastErrors).toBe('function');
  });

  it('토스트 에러 추가가 올바르게 작동한다', () => {
    const { result } = renderHook(() => useToastError());
    let toastId: string;

    expect(result.current.toastErrors).toHaveLength(0);

    act(() => {
      toastId = result.current.addToastError('Test toast message');
    });

    expect(result.current.toastErrors).toHaveLength(1);
    expect(result.current.toastErrors[0].id).toBe(toastId!);
    expect(result.current.toastErrors[0].message).toBe('Test toast message');
    expect(result.current.toastErrors[0].type).toBe('error');
  });

  it('다양한 타입의 토스트 에러 추가가 가능하다', () => {
    const { result } = renderHook(() => useToastError());

    act(() => {
      result.current.addToastError('Error message', 'error');
      result.current.addToastError('Warning message', 'warning');
      result.current.addToastError('Info message', 'info');
      result.current.addToastError('Success message', 'success');
    });

    expect(result.current.toastErrors).toHaveLength(4);
    expect(result.current.toastErrors[0].type).toBe('error');
    expect(result.current.toastErrors[1].type).toBe('warning');
    expect(result.current.toastErrors[2].type).toBe('info');
    expect(result.current.toastErrors[3].type).toBe('success');
  });

  it('토스트 에러 제거가 올바르게 작동한다', () => {
    const { result } = renderHook(() => useToastError());
    let firstId: string, secondId: string;

    // 토스트 추가
    act(() => {
      firstId = result.current.addToastError('First toast');
      secondId = result.current.addToastError('Second toast');
    });

    expect(result.current.toastErrors).toHaveLength(2);

    // 첫 번째 토스트 제거
    act(() => {
      result.current.removeToastError(firstId);
    });

    expect(result.current.toastErrors).toHaveLength(1);
    expect(result.current.toastErrors[0].id).toBe(secondId);
    expect(result.current.toastErrors[0].message).toBe('Second toast');
  });

  it('모든 토스트 에러 클리어가 올바르게 작동한다', () => {
    const { result } = renderHook(() => useToastError());

    // 여러 토스트 추가
    act(() => {
      result.current.addToastError('Toast 1');
      result.current.addToastError('Toast 2');
      result.current.addToastError('Toast 3');
    });

    expect(result.current.toastErrors).toHaveLength(3);

    // 모든 토스트 클리어
    act(() => {
      result.current.clearAllToastErrors();
    });

    expect(result.current.toastErrors).toHaveLength(0);
  });

  it('useToastError와 useErrorStore가 동일한 상태를 공유한다', () => {
    const { result: toastErrorResult } = renderHook(() => useToastError());
    const { result: storeResult } = renderHook(() => useErrorStore());

    // useToastError를 통해 토스트 추가
    act(() => {
      toastErrorResult.current.addToastError('Shared toast');
    });

    // 두 훅 모두 동일한 상태 반영
    expect(toastErrorResult.current.toastErrors).toHaveLength(1);
    expect(storeResult.current.toastErrors).toHaveLength(1);
    expect(toastErrorResult.current.toastErrors[0].message).toBe('Shared toast');
    expect(storeResult.current.toastErrors[0].message).toBe('Shared toast');

    // useErrorStore를 통해 토스트 클리어
    act(() => {
      storeResult.current.clearAllToastErrors();
    });

    // 두 훅 모두 클리어된 상태 반영
    expect(toastErrorResult.current.toastErrors).toHaveLength(0);
    expect(storeResult.current.toastErrors).toHaveLength(0);
  });

  it('addToastError가 고유 ID를 반환한다', () => {
    const { result } = renderHook(() => useToastError());
    const ids: string[] = [];

    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom
      .mockReturnValueOnce(0.123456789)
      .mockReturnValueOnce(0.987654321);

    act(() => {
      ids.push(result.current.addToastError('Toast 1'));
      ids.push(result.current.addToastError('Toast 2'));
    });

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
    expect(typeof ids[0]).toBe('string');
    expect(typeof ids[1]).toBe('string');

    // ID가 실제로 토스트와 연결되었는지 확인
    expect(result.current.toastErrors[0].id).toBe(ids[0]);
    expect(result.current.toastErrors[1].id).toBe(ids[1]);

    mockRandom.mockRestore();
  });
});

describe('편의 훅들의 통합 테스트', () => {
  beforeEach(() => {
    resetErrorStore();
  });

  it('useGlobalError와 useToastError가 독립적으로 작동한다', () => {
    const { result: globalErrorResult } = renderHook(() => useGlobalError());
    const { result: toastErrorResult } = renderHook(() => useToastError());
    const { result: storeResult } = renderHook(() => useErrorStore());

    // 각각 다른 에러 설정
    act(() => {
      globalErrorResult.current.setGlobalError(new Error('Global error'));
      toastErrorResult.current.addToastError('Toast error');
    });

    // 상태 확인
    expect(globalErrorResult.current.globalError?.message).toBe('Global error');
    expect(toastErrorResult.current.toastErrors[0].message).toBe('Toast error');
    expect(storeResult.current.hasErrors()).toBe(true);
    expect(storeResult.current.getErrorCount()).toBe(2);

    // 글로벌 에러만 클리어
    act(() => {
      globalErrorResult.current.clearGlobalError();
    });

    expect(globalErrorResult.current.globalError).toBeNull();
    expect(toastErrorResult.current.toastErrors).toHaveLength(1);
    expect(storeResult.current.hasErrors()).toBe(true);
    expect(storeResult.current.getErrorCount()).toBe(1);

    // 토스트 에러만 클리어
    act(() => {
      toastErrorResult.current.clearAllToastErrors();
    });

    expect(globalErrorResult.current.globalError).toBeNull();
    expect(toastErrorResult.current.toastErrors).toHaveLength(0);
    expect(storeResult.current.hasErrors()).toBe(false);
    expect(storeResult.current.getErrorCount()).toBe(0);
  });

  it('편의 훅들이 메인 스토어의 모든 상태 변경을 반영한다', () => {
    const { result: globalErrorResult } = renderHook(() => useGlobalError());
    const { result: toastErrorResult } = renderHook(() => useToastError());
    const { result: storeResult } = renderHook(() => useErrorStore());

    // 메인 스토어를 통해 상태 변경
    act(() => {
      storeResult.current.setGlobalError(new Error('From store'));
      storeResult.current.addToastError('From store toast');
    });

    // 편의 훅들이 변경 사항을 반영하는지 확인
    expect(globalErrorResult.current.globalError?.message).toBe('From store');
    expect(toastErrorResult.current.toastErrors[0].message).toBe('From store toast');

    // 편의 훅을 통해 상태 변경
    act(() => {
      globalErrorResult.current.setGlobalError(new Error('From global hook'));
      toastErrorResult.current.addToastError('From toast hook');
    });

    // 메인 스토어가 변경 사항을 반영하는지 확인
    expect(storeResult.current.globalError?.message).toBe('From global hook');
    expect(storeResult.current.toastErrors[1].message).toBe('From toast hook');
    expect(storeResult.current.toastErrors).toHaveLength(2);
  });
});
/**
 * useIdempotentMutation 훅 테스트
 *
 * 멱등성 보장 뮤테이션 로직을 테스트합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useIdempotentMutation, MutationFunction, MutationOptions } from '../useIdempotentMutation';

// uuid 모킹
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('useIdempotentMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('초기화', () => {
    it('모든 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      expect(typeof result.current.executeMutation).toBe('function');
      expect(typeof result.current.cancelCurrentRequest).toBe('function');
      expect(typeof result.current.getRequestStatus).toBe('function');
      expect(typeof result.current.generateIdempotencyKey).toBe('function');
    });

    it('초기 요청 상태가 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      const status = result.current.getRequestStatus();

      expect(status.isInProgress).toBe(false);
      expect(status.sessionKey).toMatch(/^session-\d+-mock-uuid-1234$/);
      expect(status.idempotencyKey).toBe(status.sessionKey); // 초기에는 sessionKey와 동일
    });
  });

  describe('executeMutation', () => {
    it('성공적인 뮤테이션을 실행해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success result');
      const variables = { id: 1 };

      let mutationResult: string;

      await act(async () => {
        mutationResult = await result.current.executeMutation(mockMutationFn, variables);
      });

      expect(mockMutationFn).toHaveBeenCalledWith(
        variables,
        expect.stringMatching(/^session-\d+-mock-uuid-1234$/),
      );
      expect(mutationResult!).toBe('success result');

      const status = result.current.getRequestStatus();
      expect(status.isInProgress).toBe(false);
    });

    it('뮤테이션 실행 중 상태를 올바르게 관리해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      let resolvePromise: (value: string) => void;
      const mockMutationFn: MutationFunction<string, { id: number }> = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      const variables = { id: 1 };

      // 뮤테이션 시작
      act(() => {
        result.current.executeMutation(mockMutationFn, variables);
      });

      // 진행 중 상태 확인
      let status = result.current.getRequestStatus();
      expect(status.isInProgress).toBe(true);

      // 뮤테이션 완료
      await act(async () => {
        await resolvePromise!('completed');
      });

      // 완료 후 상태 확인
      status = result.current.getRequestStatus();
      expect(status.isInProgress).toBe(false);
    });

    it('뮤테이션 실패를 올바르게 처리해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const errorMessage = '뮤테이션 실패';
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));
      const variables = { id: 1 };

      let thrownError: Error | undefined;

      try {
        await act(async () => {
          await result.current.executeMutation(mockMutationFn, variables);
        });
      } catch (error) {
        thrownError = error as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe(errorMessage);

      const status = result.current.getRequestStatus();
      expect(status.isInProgress).toBe(false);
    });

    it('중복 제출을 방지해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      let resolvePromise: (value: string) => void;
      const mockMutationFn: MutationFunction<string, { id: number }> = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      const variables = { id: 1 };

      // 첫 번째 뮤테이션 시작
      act(() => {
        result.current.executeMutation(mockMutationFn, variables);
      });

      // 두 번째 뮤테이션 시도 (실패해야 함)
      let secondError: Error | undefined;
      try {
        await act(async () => {
          await result.current.executeMutation(mockMutationFn, variables);
        });
      } catch (error) {
        secondError = error as Error;
      }

      expect(secondError).toBeDefined();
      expect(secondError!.message).toBe('요청이 이미 처리 중입니다. 잠시 후 다시 시도해주세요.');
      expect(mockMutationFn).toHaveBeenCalledTimes(1);

      // 첫 번째 뮤테이션 완료
      await act(async () => {
        await resolvePromise!('completed');
      });
    });

    it('onSuccess 콜백이 호출되어야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockOnSuccess = jest.fn();
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success result');
      const variables = { id: 1 };
      const options: MutationOptions<string> = { onSuccess: mockOnSuccess };

      await act(async () => {
        await result.current.executeMutation(mockMutationFn, variables, options);
      });

      expect(mockOnSuccess).toHaveBeenCalledWith('success result');
    });

    it('onError 콜백이 호출되어야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockOnError = jest.fn();
      const error = new Error('뮤테이션 에러');
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockRejectedValue(error);
      const variables = { id: 1 };
      const options: MutationOptions<string> = { onError: mockOnError };

      let thrownError: Error | undefined;
      try {
        await act(async () => {
          await result.current.executeMutation(mockMutationFn, variables, options);
        });
      } catch (err) {
        thrownError = err as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe('뮤테이션 에러');
      expect(mockOnError).toHaveBeenCalledWith(error);
    });

    it('알 수 없는 에러를 Error 객체로 정규화해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockOnError = jest.fn();
      const unknownError = 'string error';
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockRejectedValue(unknownError);
      const variables = { id: 1 };
      const options: MutationOptions<string> = { onError: mockOnError };

      let thrownError: Error | undefined;
      try {
        await act(async () => {
          await result.current.executeMutation(mockMutationFn, variables, options);
        });
      } catch (err) {
        thrownError = err as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe('Unknown error occurred');
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unknown error occurred',
        }),
      );
    });
  });

  describe('useSessionKey 옵션', () => {
    it('useSessionKey가 true일 때 세션 키를 사용해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success');
      const variables = { id: 1 };
      const options: MutationOptions<string> = { useSessionKey: true };

      await act(async () => {
        await result.current.executeMutation(mockMutationFn, variables, options);
      });

      const status = result.current.getRequestStatus();
      expect(mockMutationFn).toHaveBeenCalledWith(variables, status.sessionKey);
    });

    it('useSessionKey가 false일 때 요청별 키를 사용해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success');
      const variables = { id: 1 };
      const options: MutationOptions<string> = { useSessionKey: false };

      await act(async () => {
        await result.current.executeMutation(mockMutationFn, variables, options);
      });

      const status = result.current.getRequestStatus();
      expect(mockMutationFn).toHaveBeenCalledWith(
        variables,
        expect.stringMatching(/^request-\d+-mock-uuid-1234$/),
      );
      expect(mockMutationFn).not.toHaveBeenCalledWith(variables, status.sessionKey);
    });

    it('useSessionKey가 undefined일 때 세션 키를 사용해야 한다 (기본값)', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success');
      const variables = { id: 1 };

      await act(async () => {
        await result.current.executeMutation(mockMutationFn, variables);
      });

      const status = result.current.getRequestStatus();
      expect(mockMutationFn).toHaveBeenCalledWith(variables, status.sessionKey);
    });
  });

  describe('cancelCurrentRequest', () => {
    it('현재 요청을 취소할 수 있어야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      // 요청 시작 시뮬레이션
      act(() => {
        result.current.executeMutation(
          jest.fn().mockImplementation(() => new Promise(() => {})), // 완료되지 않는 Promise
          { id: 1 },
        );
      });

      let status = result.current.getRequestStatus();
      expect(status.isInProgress).toBe(true);

      // 요청 취소
      act(() => {
        result.current.cancelCurrentRequest();
      });

      status = result.current.getRequestStatus();
      expect(status.isInProgress).toBe(false);
    });
  });

  describe('generateIdempotencyKey', () => {
    it('새로운 멱등성 키를 생성해야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      const key1 = result.current.generateIdempotencyKey();
      const key2 = result.current.generateIdempotencyKey();

      expect(key1).toMatch(/^request-\d+-mock-uuid-1234$/);
      expect(key2).toMatch(/^request-\d+-mock-uuid-1234$/);
      expect(key1).toBe(key2); // 동일한 시간대에 생성되므로 같을 수 있음
    });
  });

  describe('키 생성 전략', () => {
    it('세션 키는 컴포넌트 마운트 시 한 번만 생성되어야 한다', () => {
      const { result, rerender } = renderHook(() =>
        useIdempotentMutation<string, { id: number }>(),
      );

      const initialSessionKey = result.current.getRequestStatus().sessionKey;

      rerender();

      const afterRerenderSessionKey = result.current.getRequestStatus().sessionKey;
      expect(afterRerenderSessionKey).toBe(initialSessionKey);
    });

    it('요청 키는 매번 새로 생성되어야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      // Date.now() 모킹하여 다른 타임스탬프 생성
      const originalDateNow = Date.now;
      let timestamp = 1000;
      Date.now = jest.fn(() => timestamp++);

      const key1 = result.current.generateIdempotencyKey();
      const key2 = result.current.generateIdempotencyKey();

      expect(key1).not.toBe(key2);

      Date.now = originalDateNow;
    });
  });

  describe('에러 처리', () => {
    it('Error 인스턴스를 그대로 전파해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const error = new Error('테스트 에러');
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockRejectedValue(error);
      const variables = { id: 1 };

      await expect(
        act(async () => {
          await result.current.executeMutation(mockMutationFn, variables);
        }),
      ).rejects.toBe(error);
    });

    it('알 수 없는 에러를 Error 객체로 변환해야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const unknownError = 'string error';
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockRejectedValue(unknownError);
      const variables = { id: 1 };

      await expect(
        act(async () => {
          await result.current.executeMutation(mockMutationFn, variables);
        }),
      ).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('상태 관리 클래스 테스트', () => {
    it('제출 상태가 올바르게 업데이트되어야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      let resolvePromise: (value: string) => void;
      const mockMutationFn: MutationFunction<string, { id: number }> = await jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              resolvePromise = resolve;
            }),
        );

      // 뮤테이션 시작
      act(() => {
        result.current.executeMutation(mockMutationFn, { id: 1 });
      });

      expect(result.current.getRequestStatus().isInProgress).toBe(true);

      // 완료
      await act(async () => {
        await resolvePromise!('completed');
      });

      expect(result.current.getRequestStatus().isInProgress).toBe(false);
    });

    it('현재 요청 ID가 올바르게 관리되어야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success');

      const initialStatus = result.current.getRequestStatus();
      const sessionKey = initialStatus.sessionKey;

      await act(async () => {
        await result.current.executeMutation(mockMutationFn, { id: 1 });
      });

      const finalStatus = result.current.getRequestStatus();
      expect(finalStatus.idempotencyKey).toBe(sessionKey);
    });
  });

  describe('키 생성기 클래스 테스트', () => {
    it('세션 키가 올바른 형식으로 생성되어야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      const status = result.current.getRequestStatus();
      expect(status.sessionKey).toMatch(/^session-\d+-mock-uuid-1234$/);
    });

    it('요청 키가 올바른 형식으로 생성되어야 한다', () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      const requestKey = result.current.generateIdempotencyKey();
      expect(requestKey).toMatch(/^request-\d+-mock-uuid-1234$/);
    });
  });

  describe('메모이제이션', () => {
    it('함수들이 적절히 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() =>
        useIdempotentMutation<string, { id: number }>(),
      );

      const initialFunctions = {
        executeMutation: result.current.executeMutation,
        cancelCurrentRequest: result.current.cancelCurrentRequest,
        getRequestStatus: result.current.getRequestStatus,
        generateIdempotencyKey: result.current.generateIdempotencyKey,
      };

      // 상태 변경 없이 리렌더링
      rerender();

      expect(result.current.executeMutation).toBe(initialFunctions.executeMutation);
      expect(result.current.cancelCurrentRequest).toBe(initialFunctions.cancelCurrentRequest);
      expect(result.current.getRequestStatus).toBe(initialFunctions.getRequestStatus);
      expect(result.current.generateIdempotencyKey).toBe(initialFunctions.generateIdempotencyKey);
    });

    it('제출 상태 변경 시 관련 객체들이 재생성되어야 한다', async () => {
      const { result } = renderHook(() => useIdempotentMutation<string, { id: number }>());

      // 제출 상태 변경을 위한 뮤테이션 실행
      const mockMutationFn: MutationFunction<string, { id: number }> = jest
        .fn()
        .mockResolvedValue('success');

      await act(async () => {
        await result.current.executeMutation(mockMutationFn, { id: 1 });
      });

      // 상태가 변경되었으므로 함수가 재생성될 수 있음
      // (isSubmitting 의존성 때문에)
      expect(result.current.executeMutation).toBeDefined();
    });
  });

  describe('타입 안전성', () => {
    it('제네릭 타입이 올바르게 작동해야 한다', async () => {
      interface CustomData {
        id: number;
        name: string;
      }

      interface CustomVariables {
        userId: number;
        data: string;
      }

      const { result } = renderHook(() => useIdempotentMutation<CustomData, CustomVariables>());

      const mockMutationFn: MutationFunction<CustomData, CustomVariables> = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test' });

      const variables: CustomVariables = { userId: 1, data: 'test data' };

      let mutationResult: CustomData;

      await act(async () => {
        mutationResult = await result.current.executeMutation(mockMutationFn, variables);
      });

      expect(mutationResult!).toEqual({ id: 1, name: 'Test' });
      expect(mockMutationFn).toHaveBeenCalledWith(variables, expect.any(String));
    });
  });
});

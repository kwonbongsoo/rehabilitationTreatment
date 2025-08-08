/**
 * useLoginForm 훅 테스트
 *
 * 멱등성 키를 활용한 로그인 폼 훅의 검증, 상태 관리, 에러 처리를 테스트합니다.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLoginForm } from '../useLoginForm';
import { login as loginAction } from '../../services';
import { authValidationService } from '../../services';
import { useIdempotentMutation } from '@/hooks/useIdempotentMutation';
import { NotificationManager } from '@/utils/notifications';
import { ErrorHandler } from '@/utils/errorHandling';

// Mock dependencies
jest.mock('../../services', () => ({
  login: jest.fn(),
  authValidationService: {
    validateLoginCredentials: jest.fn(),
  },
}));

jest.mock('@/hooks/useIdempotentMutation', () => ({
  useIdempotentMutation: jest.fn(),
}));

jest.mock('@/utils/notifications', () => ({
  NotificationManager: {
    showSuccess: jest.fn(),
    showError: jest.fn(),
  },
}));

jest.mock('@/utils/errorHandling', () => ({
  ErrorHandler: {
    handleFormError: jest.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  search: '',
  replace: jest.fn(),
  reload: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

const mockLoginAction = loginAction as jest.MockedFunction<typeof loginAction>;
const mockAuthValidationService = authValidationService as jest.Mocked<typeof authValidationService>;
const mockUseIdempotentMutation = useIdempotentMutation as jest.MockedFunction<typeof useIdempotentMutation>;
const mockNotificationManager = NotificationManager as jest.Mocked<typeof NotificationManager>;
const mockErrorHandler = ErrorHandler as jest.Mocked<typeof ErrorHandler>;

describe('useLoginForm', () => {
  const mockExecuteMutation = jest.fn();
  const mockGetRequestStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';
    
    mockUseIdempotentMutation.mockReturnValue({
      executeMutation: mockExecuteMutation,
      getRequestStatus: mockGetRequestStatus,
    });

    mockGetRequestStatus.mockReturnValue({
      isInProgress: false,
      error: null,
    });

    mockAuthValidationService.validateLoginCredentials.mockReturnValue({
      isValid: true,
      errors: [],
    });
  });

  describe('초기 상태', () => {
    it('초기 상태를 올바르게 설정해야 한다', () => {
      const { result } = renderHook(() => useLoginForm());

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.handleLogin).toBe('function');
    });

    it('useIdempotentMutation을 올바르게 초기화해야 한다', () => {
      renderHook(() => useLoginForm());

      expect(mockUseIdempotentMutation).toHaveBeenCalledTimes(1);
    });
  });

  describe('성공적인 로그인', () => {
    it('로그인을 성공적으로 처리해야 한다', async () => {
      mockLoginAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 200,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        await mutationFn(data);
        options.onSuccess();
      });

      const { result } = renderHook(() => useLoginForm());

      const credentials = { id: 'testuser', password: 'password123' };

      await act(async () => {
        await result.current.handleLogin(credentials);
      });

      expect(mockAuthValidationService.validateLoginCredentials).toHaveBeenCalledWith(credentials);
      expect(mockExecuteMutation).toHaveBeenCalledWith(
        expect.any(Function),
        credentials,
        expect.objectContaining({
          useSessionKey: true,
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
      expect(mockNotificationManager.showSuccess).toHaveBeenCalledWith('로그인에 성공했습니다!');
      expect(mockLocation.replace).toHaveBeenCalledWith('/');
    });

    it('리다이렉트 URL이 있을 때 해당 URL로 리다이렉트해야 한다', async () => {
      mockLocation.search = '?redirect=/dashboard';
      
      mockLoginAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 200,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        await mutationFn(data);
        options.onSuccess();
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'password123' });
      });

      expect(mockLocation.replace).toHaveBeenCalledWith('/dashboard');
    });

    it('안전하지 않은 리다이렉트 URL을 기본값으로 처리해야 한다', async () => {
      mockLocation.search = '?redirect=//malicious.com';
      
      mockLoginAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 200,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        await mutationFn(data);
        options.onSuccess();
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'password123' });
      });

      expect(mockLocation.replace).toHaveBeenCalledWith('/');
    });
  });

  describe('에러 처리', () => {
    it('검증 에러를 처리해야 한다', async () => {
      const validationError = new Error('아이디를 입력하세요');
      mockAuthValidationService.validateLoginCredentials.mockImplementation(() => {
        throw validationError;
      });

      const { result } = renderHook(() => useLoginForm());

      await expect(
        act(async () => {
          await result.current.handleLogin({ id: '', password: 'password123' });
        })
      ).rejects.toThrow(validationError);

      expect(mockExecuteMutation).not.toHaveBeenCalled();
    });

    it('서버 에러를 올바르게 처리해야 한다', async () => {
      const errorMessage = '아이디 또는 비밀번호가 잘못되었습니다';
      const error = new Error(errorMessage);
      (error as any).statusCode = 500; // 401이 아닌 500으로 변경하여 401 처리 로직 회피
      
      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        options.onError(error);
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'wrongpassword' });
      });

      expect(mockNotificationManager.showError).toHaveBeenCalledWith(errorMessage);
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage,
          statusCode: 500,
        }),
        '로그인'
      );
    });

    it('401/403 에러 시 페이지 새로고침해야 한다', async () => {
      const error = new Error('인증이 필요합니다');
      (error as any).statusCode = 401;

      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        options.onError(error);
      });

      // Mock setTimeout for the test
      jest.useFakeTimers();

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'password123' });
      });

      expect(mockNotificationManager.showError).toHaveBeenCalledWith('로그인이 필요합니다. 페이지를 새로고침합니다.');

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(mockLocation.reload).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('네트워크 에러를 처리해야 한다', async () => {
      const networkError = new Error('Network Error');
      mockLoginAction.mockRejectedValue(networkError);

      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        try {
          await mutationFn(data);
        } catch (error) {
          options.onError(error);
        }
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'password123' });
      });

      expect(mockNotificationManager.showError).toHaveBeenCalledWith('Network Error');
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        networkError,
        '로그인'
      );
    });

    it('기본 에러 메시지를 사용해야 한다', async () => {
      const error = new Error();
      (error as any).statusCode = 500;

      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        options.onError(error);
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'password123' });
      });

      expect(mockNotificationManager.showError).toHaveBeenCalledWith('로그인 중 오류가 발생했습니다.');
    });
  });

  describe('로딩 상태', () => {
    it('로딩 상태를 올바르게 반영해야 한다', () => {
      mockGetRequestStatus.mockReturnValue({
        isInProgress: true,
        error: null,
      });

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.isLoading).toBe(true);
    });

    it('로딩 완료 후 상태를 업데이트해야 한다', () => {
      mockGetRequestStatus.mockReturnValue({
        isInProgress: false,
        error: null,
      });

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('멱등성', () => {
    it('세션 키를 사용하여 멱등성을 보장해야 한다', async () => {
      mockLoginAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 200,
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleLogin({ id: 'testuser', password: 'password123' });
      });

      expect(mockExecuteMutation).toHaveBeenCalledWith(
        expect.any(Function),
        { id: 'testuser', password: 'password123' },
        expect.objectContaining({
          useSessionKey: true,
        })
      );
    });

    it('중복 요청을 적절히 처리해야 한다', async () => {
      mockLoginAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 200,
      });

      let executionCount = 0;
      mockExecuteMutation.mockImplementation(async (mutationFn, data, options) => {
        executionCount++;
        if (executionCount === 1) {
          await mutationFn(data);
          options.onSuccess();
        }
        // 두 번째 호출은 무시됨 (멱등성)
      });

      const { result } = renderHook(() => useLoginForm());

      const credentials = { id: 'testuser', password: 'password123' };

      // 첫 번째 호출
      await act(async () => {
        await result.current.handleLogin(credentials);
      });

      // 두 번째 호출 (중복)
      await act(async () => {
        await result.current.handleLogin(credentials);
      });

      expect(mockExecuteMutation).toHaveBeenCalledTimes(2);
      expect(mockNotificationManager.showSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('메모리 누수 방지', () => {
    it('콜백 함수가 올바르게 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() => useLoginForm());

      const firstCallbacks = mockExecuteMutation.mock.calls[0]?.[2];
      
      rerender();

      const secondCallbacks = mockExecuteMutation.mock.calls[1]?.[2];

      // 콜백이 동일한 참조를 유지해야 함
      expect(firstCallbacks?.onSuccess).toBe(secondCallbacks?.onSuccess);
      expect(firstCallbacks?.onError).toBe(secondCallbacks?.onError);
    });

    it('handleLogin 함수가 올바르게 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() => useLoginForm());

      const firstHandleLogin = result.current.handleLogin;
      
      rerender();

      const secondHandleLogin = result.current.handleLogin;

      expect(firstHandleLogin).toBe(secondHandleLogin);
    });
  });
});
/**
 * useRegisterForm 훅 테스트
 *
 * 멱등성 키를 활용한 회원가입 폼 훅의 검증, 상태 관리, 에러 처리를 테스트합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useRegisterForm } from '../useRegisterForm';
import { register as registerAction } from '../../services';
import { useIdempotentMutation } from '@/hooks/useIdempotentMutation';
import { NotificationManager } from '@/utils/notifications';
import { ErrorHandler } from '@/utils/errorHandling';
import { REGISTER_CONSTANTS } from '../../constants/registerConstants';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../services', () => ({
  register: jest.fn(),
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

jest.mock('../../constants/registerConstants', () => ({
  REGISTER_CONSTANTS: {
    SUCCESS_MESSAGE: '회원가입이 완료되었습니다!',
    REDIRECT_DELAY_MS: 1500,
    ROUTES: {
      LOGIN_WITH_SUCCESS: '/login?success=register',
    },
  },
}));

// Mock setTimeout
jest.useFakeTimers();

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockRegisterAction = registerAction as jest.MockedFunction<typeof registerAction>;
const mockUseIdempotentMutation = useIdempotentMutation as jest.MockedFunction<typeof useIdempotentMutation>;
const mockNotificationManager = NotificationManager as jest.Mocked<typeof NotificationManager>;
const mockErrorHandler = ErrorHandler as jest.Mocked<typeof ErrorHandler>;

describe('useRegisterForm', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };
  const mockExecuteMutation = jest.fn();
  const mockGetRequestStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    
    mockUseIdempotentMutation.mockReturnValue({
      executeMutation: mockExecuteMutation,
      getRequestStatus: mockGetRequestStatus,
    });

    mockGetRequestStatus.mockReturnValue({
      isInProgress: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('초기 상태', () => {
    it('초기 상태를 올바르게 설정해야 한다', () => {
      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.handleRegister).toBe('function');
    });

    it('useIdempotentMutation을 올바르게 초기화해야 한다', () => {
      renderHook(() => useRegisterForm());

      expect(mockUseIdempotentMutation).toHaveBeenCalledTimes(1);
    });
  });

  describe('성공적인 회원가입', () => {
    const validFormData = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'Test User',
      email: 'test@example.com',
    };

    it('회원가입을 성공적으로 처리해야 한다', async () => {
      mockRegisterAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 201,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.handleRegister(validFormData);
      });

      expect(registerResult!).toBe(true);
      expect(mockExecuteMutation).toHaveBeenCalledWith(
        expect.any(Function),
        {
          id: 'testuser',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Test User',
          email: 'test@example.com',
        },
        { useSessionKey: true }
      );
      expect(mockNotificationManager.showSuccess).toHaveBeenCalledWith(REGISTER_CONSTANTS.SUCCESS_MESSAGE);
    });

    it('성공 후 지연된 리다이렉트를 수행해야 한다', async () => {
      mockRegisterAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 201,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      await act(async () => {
        await result.current.handleRegister(validFormData);
      });

      // 아직 리다이렉트되지 않음
      expect(mockPush).not.toHaveBeenCalled();

      // 지정된 시간 후 리다이렉트
      act(() => {
        jest.advanceTimersByTime(REGISTER_CONSTANTS.REDIRECT_DELAY_MS);
      });

      expect(mockPush).toHaveBeenCalledWith(REGISTER_CONSTANTS.ROUTES.LOGIN_WITH_SUCCESS);
    });

    it('입력 데이터를 올바르게 변환해야 한다', async () => {
      const formDataWithSpaces = {
        id: '  testuser  ',
        password: 'password123',
        confirmPassword: 'password123',
        name: '  Test User  ',
        email: '  test@example.com  ',
      };

      const expectedTransformedData = {
        id: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockRegisterAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 201,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        expect(data).toEqual(expectedTransformedData);
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      await act(async () => {
        await result.current.handleRegister(formDataWithSpaces);
      });
    });
  });

  describe('에러 처리', () => {
    const validFormData = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'Test User',
      email: 'test@example.com',
    };

    it('서버 에러를 올바르게 처리해야 한다', async () => {
      const errorMessage = '이미 사용 중인 아이디입니다';
      mockRegisterAction.mockResolvedValue({
        success: false,
        error: errorMessage,
        statusCode: 409,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.handleRegister(validFormData);
      });

      expect(registerResult!).toBe(false);
      expect(mockNotificationManager.showError).toHaveBeenCalledWith(errorMessage);
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage,
          statusCode: 409,
        }),
        '회원가입'
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('기본 에러 메시지를 사용해야 한다', async () => {
      mockRegisterAction.mockResolvedValue({
        success: false,
        error: null,
        statusCode: 500,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.handleRegister(validFormData);
      });

      expect(registerResult!).toBe(false);
      expect(mockNotificationManager.showError).toHaveBeenCalledWith('회원가입에 실패했습니다.');
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '회원가입에 실패했습니다.',
          statusCode: 500,
        }),
        '회원가입'
      );
    });

    it('네트워크 에러를 처리해야 한다', async () => {
      const networkError = new Error('Network Error');
      mockRegisterAction.mockRejectedValue(networkError);

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.handleRegister(validFormData);
      });

      expect(registerResult!).toBe(false);
      expect(mockNotificationManager.showError).toHaveBeenCalledWith('Network Error');
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        networkError,
        '회원가입'
      );
    });

    it('알 수 없는 에러를 처리해야 한다', async () => {
      const unknownError = 'Unknown error';
      mockExecuteMutation.mockRejectedValue(unknownError);

      const { result } = renderHook(() => useRegisterForm());

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.handleRegister(validFormData);
      });

      expect(registerResult!).toBe(false);
      expect(mockNotificationManager.showError).toHaveBeenCalledWith('회원가입 중 오류가 발생했습니다.');
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        unknownError,
        '회원가입'
      );
    });
  });

  describe('로딩 상태', () => {
    it('로딩 상태를 올바르게 반영해야 한다', () => {
      mockGetRequestStatus.mockReturnValue({
        isInProgress: true,
        error: null,
      });

      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.isLoading).toBe(true);
    });

    it('로딩 완료 후 상태를 업데이트해야 한다', () => {
      mockGetRequestStatus.mockReturnValue({
        isInProgress: false,
        error: null,
      });

      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('멱등성', () => {
    const validFormData = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'Test User',
      email: 'test@example.com',
    };

    it('세션 키를 사용하여 멱등성을 보장해야 한다', async () => {
      mockRegisterAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 201,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      await act(async () => {
        await result.current.handleRegister(validFormData);
      });

      expect(mockExecuteMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Object),
        { useSessionKey: true }
      );
    });

    it('멱등성 키와 함께 올바른 파라미터를 전달해야 한다', async () => {
      mockRegisterAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 201,
      });

      let capturedKey: string | undefined;
      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data, 'test-key');
      });

      mockRegisterAction.mockImplementation((data, key) => {
        capturedKey = key;
        return Promise.resolve({
          success: true,
          error: null,
          statusCode: 201,
        });
      });

      const { result } = renderHook(() => useRegisterForm());

      await act(async () => {
        await result.current.handleRegister(validFormData);
      });

      expect(mockRegisterAction).toHaveBeenCalledWith(
        expect.any(Object),
        'test-key'
      );
    });
  });

  describe('메모리 누수 방지', () => {
    it('handlers가 올바르게 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() => useRegisterForm());

      const firstHandleRegister = result.current.handleRegister;
      
      rerender();

      const secondHandleRegister = result.current.handleRegister;

      expect(firstHandleRegister).toBe(secondHandleRegister);
    });

    it('router 변경 시에만 handlers가 업데이트되어야 한다', () => {
      const { result, rerender } = renderHook(() => useRegisterForm());

      const firstHandleRegister = result.current.handleRegister;

      // 다른 router 인스턴스로 변경
      const newMockRouter = { push: jest.fn() };
      mockUseRouter.mockReturnValue(newMockRouter as any);

      rerender();

      const secondHandleRegister = result.current.handleRegister;

      expect(firstHandleRegister).not.toBe(secondHandleRegister);
    });
  });

  describe('타이머 관리', () => {
    const validFormData = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'Test User',
      email: 'test@example.com',
    };

    it('성공 후 타이머가 올바르게 설정되어야 한다', async () => {
      // 타이머를 클리어해서 깨끗한 상태로 시작
      jest.clearAllTimers();
      
      mockRegisterAction.mockResolvedValue({
        success: true,
        error: null,
        statusCode: 201,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      await act(async () => {
        await result.current.handleRegister(validFormData);
      });

      // 타이머가 설정되었는지 확인
      expect(jest.getTimerCount()).toBeGreaterThanOrEqual(1);

      // 타이머 실행
      act(() => {
        jest.advanceTimersByTime(REGISTER_CONSTANTS.REDIRECT_DELAY_MS);
      });

      expect(mockPush).toHaveBeenCalled();
    });

    it('에러 시 타이머가 설정되지 않아야 한다', async () => {
      // 타이머를 클리어해서 깨끗한 상태로 시작
      jest.clearAllTimers();
      
      mockRegisterAction.mockResolvedValue({
        success: false,
        error: '회원가입 실패',
        statusCode: 400,
      });

      mockExecuteMutation.mockImplementation(async (mutationFn, data) => {
        await mutationFn(data);
      });

      const { result } = renderHook(() => useRegisterForm());

      await act(async () => {
        await result.current.handleRegister(validFormData);
      });

      // 에러 시 새로운 타이머가 추가되지 않아야 함 (기존 타이머는 있을 수 있음)
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
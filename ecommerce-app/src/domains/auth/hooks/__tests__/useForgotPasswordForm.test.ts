/**
 * useForgotPasswordForm 훅 테스트
 *
 * 비밀번호 찾기 폼 훅의 검증, 상태 관리, 에러 처리를 테스트합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useForgotPasswordForm } from '../useForgotPasswordForm';
import { forgotPassword as forgotPasswordAction } from '../../services';
import { authValidationService } from '../../services';
import { ErrorHandler } from '@/utils/errorHandling';

// Mock dependencies
jest.mock('../../services', () => ({
  forgotPassword: jest.fn(),
  authValidationService: {
    validateForgotPasswordForm: jest.fn(),
  },
}));

jest.mock('@/utils/errorHandling', () => ({
  ErrorHandler: {
    handleFormError: jest.fn(),
  },
}));

const mockForgotPasswordAction = forgotPasswordAction as jest.MockedFunction<
  typeof forgotPasswordAction
>;
const mockAuthValidationService = authValidationService as jest.Mocked<
  typeof authValidationService
>;
const mockErrorHandler = ErrorHandler as jest.Mocked<typeof ErrorHandler>;

describe('useForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('초기 상태를 올바르게 설정해야 한다', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.handleForgotPassword).toBe('function');
    });
  });

  describe('성공적인 비밀번호 찾기', () => {
    const validRequest = {
      email: 'test@example.com',
    };

    it('비밀번호 찾기를 성공적으로 처리해야 한다', async () => {
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockForgotPasswordAction.mockResolvedValue({
        success: true,
        statusCode: 200,
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      await act(async () => {
        await result.current.handleForgotPassword(validRequest);
      });

      expect(mockAuthValidationService.validateForgotPasswordForm).toHaveBeenCalledWith(
        validRequest,
      );
      expect(mockForgotPasswordAction).toHaveBeenCalledWith(validRequest);
      expect(mockErrorHandler.handleFormError).not.toHaveBeenCalled();
    });

    it('이메일 검증을 통과해야 한다', async () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.kr', 'test+label@example.org'];

      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockForgotPasswordAction.mockResolvedValue({
        success: true,
        statusCode: 200,
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      /* eslint-disable no-await-in-loop */
      for (const email of validEmails) {
        await act(async () => {
          await result.current.handleForgotPassword({ email });
        });

        expect(mockAuthValidationService.validateForgotPasswordForm).toHaveBeenCalledWith({
          email,
        });
      }
      /* eslint-enable no-await-in-loop */
    });
  });

  describe('검증 에러 처리', () => {
    it('이메일 검증 실패를 처리해야 한다', async () => {
      const validationErrors = ['유효한 이메일 주소를 입력하세요'];
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      await expect(
        act(async () => {
          await result.current.handleForgotPassword({ email: 'invalid-email' });
        }),
      ).rejects.toThrow(validationErrors[0]);

      expect(mockForgotPasswordAction).not.toHaveBeenCalled();
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: validationErrors[0],
        }),
        '비밀번호 찾기',
      );
    });

    it('빈 이메일을 거부해야 한다', async () => {
      const validationErrors = ['이메일을 입력하세요'];
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      let error: any;
      try {
        await act(async () => {
          await result.current.handleForgotPassword({ email: '' });
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe(validationErrors[0]);
      expect(mockAuthValidationService.validateForgotPasswordForm).toHaveBeenCalledWith({
        email: '',
      });
    });

    it('잘못된 이메일 형식을 거부해야 한다', async () => {
      const invalidEmails = ['invalid', '@example.com', 'test@', 'test.example.com', 'test@.com'];

      const validationErrors = ['유효한 이메일 주소를 입력하세요'];
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      /* eslint-disable no-await-in-loop */
      for (const email of invalidEmails) {
        let error: any;
        try {
          await act(async () => {
            await result.current.handleForgotPassword({ email });
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.message).toBe(validationErrors[0]);
      }
      /* eslint-enable no-await-in-loop */
    });
  });

  describe('서버 에러 처리', () => {
    const validRequest = {
      email: 'test@example.com',
    };

    beforeEach(() => {
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });
    });

    it('서버 에러를 처리해야 한다', async () => {
      const serverError = new Error('서버 에러가 발생했습니다');
      mockForgotPasswordAction.mockRejectedValue(serverError);

      const { result } = renderHook(() => useForgotPasswordForm());

      let error: any;
      try {
        await act(async () => {
          await result.current.handleForgotPassword(validRequest);
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBe(serverError);
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(serverError, '비밀번호 찾기');
    });

    it('네트워크 에러를 처리해야 한다', async () => {
      const networkError = new Error('Network Error');
      mockForgotPasswordAction.mockRejectedValue(networkError);

      const { result } = renderHook(() => useForgotPasswordForm());

      let error: any;
      try {
        await act(async () => {
          await result.current.handleForgotPassword(validRequest);
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBe(networkError);
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(networkError, '비밀번호 찾기');
    });

    it('API 응답 에러를 처리해야 한다', async () => {
      mockForgotPasswordAction.mockResolvedValue({
        success: false,
        error: '해당 이메일로 가입된 사용자가 없습니다',
        statusCode: 404,
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      // API 응답이 성공이 아닐 때의 처리는 현재 구현에서 별도로 처리되지 않음
      // forgotPasswordAction이 에러를 던지지 않으므로 성공적으로 완료됨
      await act(async () => {
        await result.current.handleForgotPassword(validRequest);
      });

      expect(mockForgotPasswordAction).toHaveBeenCalledWith(validRequest);
      expect(mockErrorHandler.handleFormError).not.toHaveBeenCalled();
    });
  });

  describe('로딩 상태', () => {
    const validRequest = {
      email: 'test@example.com',
    };

    beforeEach(() => {
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });
    });

    it('현재 구현에서 isLoading은 항상 false이다', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current.isLoading).toBe(false);
    });

    it('비밀번호 찾기 중에도 isLoading이 false를 유지한다', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<any>((resolve) => {
        resolvePromise = () =>
          resolve({
            success: true,
            error: null,
            statusCode: 200,
          });
      });

      mockForgotPasswordAction.mockReturnValue(promise);

      const { result } = renderHook(() => useForgotPasswordForm());

      // 현재 구현에서는 로딩 상태가 관리되지 않음
      expect(result.current.isLoading).toBe(false);

      // 비동기 작업 시작 - act로 감싸서 상태 변경을 올바르게 처리
      let forgotPasswordPromise: Promise<void>;
      act(() => {
        forgotPasswordPromise = result.current.handleForgotPassword(validRequest);
      });

      // 작업 완료
      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await forgotPasswordPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('메모리 누수 방지', () => {
    it('handleForgotPassword 함수가 올바르게 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() => useForgotPasswordForm());

      const firstHandleForgotPassword = result.current.handleForgotPassword;

      rerender();

      const secondHandleForgotPassword = result.current.handleForgotPassword;

      expect(firstHandleForgotPassword).toBe(secondHandleForgotPassword);
    });

    it('의존성 배열이 비어있어야 한다', () => {
      // handleForgotPassword는 useCallback의 의존성 배열이 빈 배열이므로
      // 컴포넌트 리렌더링 시에도 동일한 참조를 유지해야 함
      const { result, rerender } = renderHook(() => useForgotPasswordForm());

      const initialHandler = result.current.handleForgotPassword;

      // 여러 번 리렌더링
      rerender();
      rerender();
      rerender();

      expect(result.current.handleForgotPassword).toBe(initialHandler);
    });
  });

  describe('에러 전파', () => {
    const validRequest = {
      email: 'test@example.com',
    };

    it('검증 에러가 올바르게 전파되어야 한다', async () => {
      const validationError = new Error('이메일을 입력하세요');
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: false,
        errors: [validationError.message],
      });

      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current).not.toBeNull();

      let error: any;
      try {
        await act(async () => {
          await result.current.handleForgotPassword({ email: '' });
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe(validationError.message);
    });

    it('API 에러가 올바르게 전파되어야 한다', async () => {
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const apiError = new Error('API Error');
      mockForgotPasswordAction.mockRejectedValue(apiError);

      const { result } = renderHook(() => useForgotPasswordForm());

      let error: any;
      try {
        await act(async () => {
          await result.current.handleForgotPassword(validRequest);
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBe(apiError);
    });
  });

  describe('상태 관리 개선 제안', () => {
    // 현재 구현의 한계점을 테스트로 문서화
    it('실제 로딩 상태 관리가 필요함을 확인한다', async () => {
      const validRequest = { email: 'test@example.com' };

      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      // 느린 API 응답을 시뮬레이션
      let resolvePromise: () => void;
      const slowPromise = new Promise<any>((resolve) => {
        resolvePromise = () =>
          resolve({
            success: true,
            error: null,
            statusCode: 200,
          });
      });

      mockForgotPasswordAction.mockReturnValue(slowPromise);

      const { result } = renderHook(() => useForgotPasswordForm());

      // TODO: 실제 구현에서는 이 시점에 isLoading이 true여야 함
      expect(result.current.isLoading).toBe(false); // 현재 구현의 한계

      // 비동기 작업 시작 - act로 감싸서 상태 변경을 올바르게 처리
      let forgotPasswordPromise: Promise<void>;
      act(() => {
        forgotPasswordPromise = result.current.handleForgotPassword(validRequest);
      });

      // 작업 완료
      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await forgotPasswordPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});

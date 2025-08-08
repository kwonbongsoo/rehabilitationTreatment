/**
 * AuthService 단위 테스트
 */
import { AuthService } from '../AuthService';
import { TokenService } from '../TokenService';
import { AuthValidationService } from '../ValidationService';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
} from '../../types/auth';

// Mock 의존성
jest.mock('../TokenService');
jest.mock('../ValidationService');

describe('AuthService', () => {
  let authService: AuthService;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockValidationService: jest.Mocked<AuthValidationService>;

  beforeEach(() => {
    mockTokenService = new TokenService() as jest.Mocked<TokenService>;
    mockValidationService = new AuthValidationService() as jest.Mocked<AuthValidationService>;
    authService = new AuthService(mockTokenService, mockValidationService);
  });

  describe('생성자', () => {
    it('TokenService와 AuthValidationService를 주입받아 생성된다', () => {
      expect(authService).toBeInstanceOf(AuthService);
      expect(authService.tokens).toBe(mockTokenService);
      expect(authService.validation).toBe(mockValidationService);
    });
  });

  describe('login', () => {
    const validLoginRequest: LoginRequest = {
      id: 'testuser',
      password: 'password123',
    };

    it('유효한 로그인 요청에 대해 검증을 수행한다', () => {
      mockValidationService.validateLoginCredentials.mockReturnValue({
        isValid: true,
        errors: [],
      });

      expect(() => authService.login(validLoginRequest)).toThrow(
        '로그인 로직은 서버 액션에서 처리됩니다.'
      );

      expect(mockValidationService.validateLoginCredentials).toHaveBeenCalledWith(
        validLoginRequest
      );
      expect(mockValidationService.validateLoginCredentials).toHaveBeenCalledTimes(1);
    });

    it('검증 실패 시 예외를 발생시킨다', () => {
      const validationError = new Error('아이디를 입력해주세요.');
      mockValidationService.validateLoginCredentials.mockImplementation(() => {
        throw validationError;
      });

      expect(() => authService.login(validLoginRequest)).toThrow(validationError);
      expect(mockValidationService.validateLoginCredentials).toHaveBeenCalledWith(
        validLoginRequest
      );
    });
  });

  describe('register', () => {
    const validRegisterRequest: RegisterRequest = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: '테스트 사용자',
      email: 'test@example.com',
    };

    it('유효한 회원가입 요청에 대해 검증을 수행한다', () => {
      mockValidationService.validateRegisterForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      expect(() => authService.register(validRegisterRequest)).toThrow(
        '회원가입 로직은 서버 액션에서 처리됩니다.'
      );

      expect(mockValidationService.validateRegisterForm).toHaveBeenCalledWith(
        validRegisterRequest
      );
      expect(mockValidationService.validateRegisterForm).toHaveBeenCalledTimes(1);
    });

    it('검증 실패 시 예외를 발생시킨다', () => {
      const validationError = new Error('이메일 형식이 올바르지 않습니다.');
      mockValidationService.validateRegisterForm.mockImplementation(() => {
        throw validationError;
      });

      expect(() => authService.register(validRegisterRequest)).toThrow(validationError);
      expect(mockValidationService.validateRegisterForm).toHaveBeenCalledWith(
        validRegisterRequest
      );
    });
  });

  describe('forgotPassword', () => {
    const validForgotPasswordRequest: ForgotPasswordRequest = {
      email: 'test@example.com',
    };

    it('유효한 비밀번호 찾기 요청에 대해 검증을 수행한다', () => {
      mockValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      expect(() => authService.forgotPassword(validForgotPasswordRequest)).toThrow(
        '비밀번호 찾기 로직은 서버 액션에서 처리됩니다.'
      );

      expect(mockValidationService.validateForgotPasswordForm).toHaveBeenCalledWith(
        validForgotPasswordRequest
      );
      expect(mockValidationService.validateForgotPasswordForm).toHaveBeenCalledTimes(1);
    });

    it('검증 실패 시 예외를 발생시킨다', () => {
      const validationError = new Error('이메일을 입력해주세요.');
      mockValidationService.validateForgotPasswordForm.mockImplementation(() => {
        throw validationError;
      });

      expect(() => authService.forgotPassword(validForgotPasswordRequest)).toThrow(
        validationError
      );
      expect(mockValidationService.validateForgotPasswordForm).toHaveBeenCalledWith(
        validForgotPasswordRequest
      );
    });
  });

  describe('접근자 메서드', () => {
    it('tokens 접근자가 TokenService 인스턴스를 반환한다', () => {
      expect(authService.tokens).toBe(mockTokenService);
    });

    it('validation 접근자가 AuthValidationService 인스턴스를 반환한다', () => {
      expect(authService.validation).toBe(mockValidationService);
    });
  });
});

describe('AuthService 싱글톤', () => {
  it('authService 인스턴스가 올바르게 생성된다', () => {
    // authService는 AuthService.ts에서 export된 싱글톤 인스턴스
    const { authService } = require('../AuthService');
    
    expect(authService).toBeInstanceOf(AuthService);
    expect(authService.tokens).toBeInstanceOf(TokenService);
    expect(authService.validation).toBeInstanceOf(AuthValidationService);
  });
});
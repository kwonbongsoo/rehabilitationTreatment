/**
 * Auth 도메인 통합 서비스
 *
 * 인증 관련 모든 비즈니스 로직을 통합 관리합니다.
 */
import { TokenService } from './TokenService';
import { AuthValidationService } from './ValidationService';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
} from '../types/auth';

/**
 * Auth 도메인 서비스 클래스
 */
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly validationService: AuthValidationService,
  ) {}

  /**
   * 로그인 처리
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // 1. 입력 검증
    this.validationService.validateLoginCredentials(request);

    // 2. 실제 로그인 로직은 서버 액션에서 처리
    // 여기서는 검증만 수행
    throw new Error('로그인 로직은 서버 액션에서 처리됩니다.');
  }

  /**
   * 회원가입 처리
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    // 1. 입력 검증
    this.validationService.validateRegisterForm(request);

    // 2. 실제 회원가입 로직은 서버 액션에서 처리
    // 여기서는 검증만 수행
    throw new Error('회원가입 로직은 서버 액션에서 처리됩니다.');
  }

  /**
   * 비밀번호 찾기 처리
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    // 1. 입력 검증
    this.validationService.validateForgotPasswordForm(request);

    // 2. 실제 비밀번호 찾기 로직은 서버 액션에서 처리
    // 여기서는 검증만 수행
    throw new Error('비밀번호 찾기 로직은 서버 액션에서 처리됩니다.');
  }

  /**
   * 토큰 서비스 접근자
   */
  get tokens() {
    return this.tokenService;
  }

  /**
   * 검증 서비스 접근자
   */
  get validation() {
    return this.validationService;
  }
}

// 싱글톤 인스턴스 생성
const tokenService = new TokenService();
const validationService = new AuthValidationService();

export const authService = new AuthService(tokenService, validationService);

import { Config } from '../config/config';
import { MemberApiClient } from '../utils/memberApiClient';
import { BaseTokenPayload, LoginBody, TokenPayload, TokenResponseDataI } from '../interfaces/auth';
import { TokenService } from './tokenService';
import { SessionService } from './sessionService';
import { ValidationService } from './validationService';
import { AuthenticationError } from '../middlewares/errorMiddleware';

/**
 * 인증 서비스: 인증 관련 비즈니스 로직 처리
 */
export class AuthService {
  private config: Config;
  private memberApiClient: MemberApiClient;
  private tokenService: TokenService;
  private sessionService: SessionService;
  private validationService: ValidationService;
  private static instance: AuthService;

  constructor(
    config?: Config,
    memberApiClient?: MemberApiClient,
    tokenService?: TokenService,
    sessionService?: SessionService,
    validationService?: ValidationService,
  ) {
    this.config = config || new Config();
    this.memberApiClient = memberApiClient || MemberApiClient.getInstance(this.config);
    this.tokenService = tokenService || TokenService.getInstance(this.config);
    this.sessionService = sessionService || SessionService.getInstance();
    this.validationService = validationService || ValidationService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(new Config());
    }
    return AuthService.instance;
  }

  /**
   * 사용자 로그인 처리
   */
  public async login(credentials: LoginBody, previousToken?: string): Promise<TokenResponseDataI> {
    // 입력 유효성 검증
    this.validationService.validateCredentials(credentials);

    // 기존 게스트 토큰이 있다면 만료 처리 (세션 고정 공격 방지)
    if (previousToken) {
      await this.sessionService.removeSession(previousToken);
    }

    // 멤버 API에서 사용자 검증
    const user = await this.memberApiClient.verifyCredentials(credentials.id, credentials.password);

    // 유저 토큰 생성
    const tokenResponse = this.tokenService.generateUserToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Redis에 세션 저장
    const now = Math.floor(Date.now() / 1000);
    const ttl = Math.max(0, tokenResponse.payload.exp - now);
    await this.sessionService.storeSession(tokenResponse.token, tokenResponse.payload, ttl);

    return {
      data: {
        access_token: tokenResponse.token,
        role: tokenResponse.payload.role,
        exp: tokenResponse.payload.exp,
        iat: tokenResponse.payload.iat,
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * 게스트 토큰 발급
   */
  public async createGuestToken(): Promise<TokenResponseDataI> {
    const tokenResponse = this.tokenService.generateGuestToken();
    const ttl = tokenResponse.payload.exp - Math.floor(Date.now() / 1000);
    await this.sessionService.storeSession(tokenResponse.token, tokenResponse.payload, ttl);

    return {
      data: {
        access_token: tokenResponse.token,
        role: tokenResponse.payload.role,
        exp: tokenResponse.payload.exp,
        iat: tokenResponse.payload.iat,
      },
    };
  }

  /**
   * 토큰으로 사용자 정보 조회
   */
  public async getUserInfoByToken(token: string): Promise<TokenResponseDataI> {
    // 토큰 검증
    this.tokenService.verifyToken(token);

    // 세션 정보 조회
    const sessionData = await this.sessionService.getSession(token);

    if (!sessionData) {
      throw new AuthenticationError('Session not found or expired');
    }

    return {
      data: {
        access_token: token,
        ...sessionData,
      },
    };
  }

  /**
   * 토큰으로 세션 정보 조회
   */
  public async getSessionInfoByToken(token: string): Promise<TokenResponseDataI> {
    return this.getUserInfoByToken(token);
  }

  /**
   * 토큰 유효성 및 상태 확인
   */
  public verifyTokenWithStatus(token: string): { status: number; message: string } {
    return this.tokenService.verifyTokenWithStatus(token);
  }

  /**
   * 토큰 세션 삭제 (로그아웃)
   */
  public async removeSession(token: string): Promise<void> {
    await this.sessionService.removeSession(token);
  }
}

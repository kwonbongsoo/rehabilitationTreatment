import { Config } from '../config/config';
import { MemberApiClient } from '../utils/memberApiClient';
import { LoginBody, TokenPayload } from '../interfaces/auth';
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

    constructor(
        config?: Config,
        memberApiClient?: MemberApiClient,
        tokenService?: TokenService,
        sessionService?: SessionService,
        validationService?: ValidationService
    ) {
        this.config = config || new Config();
        this.memberApiClient = memberApiClient || new MemberApiClient(this.config);
        this.tokenService = tokenService || new TokenService(this.config);
        this.sessionService = sessionService || new SessionService();
        this.validationService = validationService || new ValidationService();
    }

    /**
     * 사용자 로그인 처리
     */
    public async login(credentials: LoginBody): Promise<{ token: string }> {
        // 입력 유효성 검증
        this.validationService.validateCredentials(credentials);

        // 멤버 API에서 사용자 검증
        const user = await this.memberApiClient.verifyCredentials(
            credentials.username,
            credentials.password
        );

        // 토큰 생성
        const token = this.tokenService.generateToken(user);

        // Redis에 세션 저장
        const expiresIn = this.config.getJwtExpiresIn();
        await this.sessionService.storeSession(token, user, expiresIn);

        return { token };
    }

    /**
     * 게스트 토큰 발급
     */
    public createGuestToken(): string {
        const guestPayload: TokenPayload = {
            id: 'guest-' + Date.now(),
            name: 'Guest User',
            role: 'guest'
        };

        return this.tokenService.generateToken(guestPayload);
    }

    /**
     * 토큰으로 사용자 정보 조회
     */
    public async getUserInfoByToken(token: string): Promise<TokenPayload> {
        // 토큰 검증
        this.tokenService.verifyToken(token);

        // 세션 정보 조회
        const sessionData = await this.sessionService.getSession(token);

        if (!sessionData) {
            throw new AuthenticationError('Session not found or expired');
        }

        return sessionData;
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
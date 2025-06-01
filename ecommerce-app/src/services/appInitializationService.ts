import type { AppContext } from 'next/app';
import { issueGuestTokenWithCookieSSR } from './tokenService';
import { cookieService } from './cookieService';

// 도메인 타입 정의
export interface ServerContext {
    req: NonNullable<AppContext['ctx']['req']>;
    res: NonNullable<AppContext['ctx']['res']>;
}

export interface RequestMetadata {
    id: string;
    timestamp: number;
    userAgent?: string;
}

export interface InitializationResult {
    success: boolean;
    requestId: string;
    error?: Error;
}

// 환경 검증 인터페이스
interface IEnvironmentValidator {
    isServerSide(ctx: AppContext['ctx']): ctx is AppContext['ctx'] & ServerContext;
}

// 요청 메타데이터 관리 인터페이스
interface IRequestMetadataManager {
    generateRequestId(ctx: AppContext['ctx']): string;
    extractMetadata(ctx: AppContext['ctx']): RequestMetadata;
}

// 토큰 관리 인터페이스
interface ITokenManager {
    hasExistingToken(ctx: AppContext['ctx']): boolean;
    issueGuestToken(ctx: ServerContext, requestId: string): Promise<void>;
}

// 로깅 인터페이스
interface IAppLogger {
    logTokenIssuance(requestId: string, success: boolean): void;
    logError(requestId: string, error: Error, context: string): void;
    logWarning(requestId: string, message: string): void;
}

// 환경 검증기 클래스 (단일 책임 원칙)
class EnvironmentValidator implements IEnvironmentValidator {
    isServerSide(ctx: AppContext['ctx']): ctx is AppContext['ctx'] & ServerContext {
        return typeof window === 'undefined' &&
            Boolean(ctx.req) &&
            Boolean(ctx.res);
    }
}

// 요청 메타데이터 관리자 클래스 (단일 책임 원칙)
class RequestMetadataManager implements IRequestMetadataManager {
    private static readonly FALLBACK_ID_PREFIX = 'app-init';

    generateRequestId(ctx: AppContext['ctx']): string {
        const headerRequestId = ctx.req?.headers['x-request-id'] as string;

        if (headerRequestId) {
            return headerRequestId;
        }

        // 타임스탬프 기반 고유 ID 생성
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        return `${RequestMetadataManager.FALLBACK_ID_PREFIX}-${timestamp}-${randomSuffix}`;
    }

    extractMetadata(ctx: AppContext['ctx']): RequestMetadata {
        const id = this.generateRequestId(ctx);
        const timestamp = Date.now();
        const userAgent = ctx.req?.headers['user-agent'];

        return {
            id,
            timestamp,
            userAgent
        };
    }
}

// 토큰 관리자 클래스 (단일 책임 원칙)
class TokenManager implements ITokenManager {
    hasExistingToken(ctx: AppContext['ctx']): boolean {
        const cookieHeader = ctx.req?.headers.cookie as string;
        const existingToken = cookieService.getTokenFromHeader(cookieHeader);
        return Boolean(existingToken);
    }

    async issueGuestToken(ctx: ServerContext, requestId: string): Promise<void> {
        try {
            await issueGuestTokenWithCookieSSR(ctx.res);
        } catch (error) {
            const enhancedError = new Error(
                `토큰 발급 실패 [${requestId}]: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            enhancedError.cause = error;
            throw enhancedError;
        }
    }
}

// 앱 로거 클래스 (단일 책임 원칙)
class AppLogger implements IAppLogger {
    private static readonly LOG_PREFIX = '🏗️ [App Init]';

    logTokenIssuance(requestId: string, success: boolean): void {
        const status = success ? '✅' : '❌';
        const message = success ? '토큰 발급 완료' : '토큰 발급 실패';
        console.log(`${status} ${AppLogger.LOG_PREFIX} [${requestId}] ${message}`);
    }

    logError(requestId: string, error: Error, context: string): void {
        console.error(
            `❌ ${AppLogger.LOG_PREFIX} [${requestId}] ${context}:`,
            {
                message: error.message,
                stack: error.stack,
                cause: error.cause
            }
        );
    }

    logWarning(requestId: string, message: string): void {
        console.warn(`⚠️ ${AppLogger.LOG_PREFIX} [${requestId}] ${message}`);
    }
}

// 토큰 초기화 전략 인터페이스 (전략 패턴)
interface ITokenInitializationStrategy {
    shouldInitialize(ctx: AppContext['ctx'], metadata: RequestMetadata): boolean;
    execute(ctx: ServerContext, metadata: RequestMetadata): Promise<void>;
}

// 조건부 토큰 초기화 전략 (전략 패턴)
class ConditionalTokenInitializationStrategy implements ITokenInitializationStrategy {
    constructor(
        private tokenManager: ITokenManager,
        private logger: IAppLogger
    ) { }

    shouldInitialize(ctx: AppContext['ctx'], metadata: RequestMetadata): boolean {
        return !this.tokenManager.hasExistingToken(ctx);
    }

    async execute(ctx: ServerContext, metadata: RequestMetadata): Promise<void> {
        // ctx를 AppContext['ctx'] 타입으로 변환하여 검증
        const appCtx = ctx as AppContext['ctx'];

        if (this.shouldInitialize(appCtx, metadata)) {
            await this.tokenManager.issueGuestToken(ctx, metadata.id);
            this.logger.logTokenIssuance(metadata.id, true);
        }
    }
}

// 앱 초기화 서비스 클래스 (조합 패턴)
export class AppInitializationService {
    constructor(
        private environmentValidator: IEnvironmentValidator,
        private metadataManager: IRequestMetadataManager,
        private tokenStrategy: ITokenInitializationStrategy,
        private logger: IAppLogger
    ) { }

    async initialize(appContext: AppContext): Promise<InitializationResult> {
        const { ctx } = appContext;
        const metadata = this.metadataManager.extractMetadata(ctx);

        try {
            // 서버사이드에서만 실행
            if (!this.environmentValidator.isServerSide(ctx)) {
                return {
                    success: true,
                    requestId: metadata.id
                };
            }

            // 토큰 초기화 실행
            await this.tokenStrategy.execute(ctx, metadata);

            return {
                success: true,
                requestId: metadata.id
            };

        } catch (error) {
            const processedError = error instanceof Error ? error : new Error('Unknown initialization error');

            this.logger.logError(metadata.id, processedError, '앱 초기화');
            this.logger.logWarning(metadata.id, '초기화 실패했지만 앱은 계속 실행됩니다');

            return {
                success: false,
                requestId: metadata.id,
                error: processedError
            };
        }
    }
}

// 팩토리 함수 (의존성 주입 컨테이너 역할)
export const createAppInitializationService = (): AppInitializationService => {
    const environmentValidator = new EnvironmentValidator();
    const metadataManager = new RequestMetadataManager();
    const tokenManager = new TokenManager();
    const logger = new AppLogger();

    const tokenStrategy = new ConditionalTokenInitializationStrategy(
        tokenManager,
        logger
    );

    return new AppInitializationService(
        environmentValidator,
        metadataManager,
        tokenStrategy,
        logger
    );
};

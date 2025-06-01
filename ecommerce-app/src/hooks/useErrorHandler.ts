import { useCallback } from 'react';
import { useErrorStore } from '../store/errorStore';
import { ApiError } from '../api/types';

// 도메인 타입 정의
export type ErrorType = 'global' | 'toast';

export interface ErrorHandlerOptions {
    type?: ErrorType;
    shouldLog?: boolean;
    context?: string;
}

export interface ErrorInfo {
    error: Error | ApiError;
    timestamp: number;
    context?: string;
}

// 에러 타입 검증 인터페이스
interface IErrorTypeChecker {
    isApiError(error: unknown): error is ApiError;
    isStandardError(error: unknown): error is Error;
}

// 에러 메시지 처리 인터페이스
interface IErrorMessageProcessor {
    formatErrorMessage(error: Error | ApiError): string;
    createErrorInfo(error: Error | ApiError, context?: string): ErrorInfo;
}

// 로깅 처리 인터페이스
interface IErrorLogger {
    logError(errorInfo: ErrorInfo): void;
    shouldLog(environment: string): boolean;
}

// 에러 스토어 어댑터 인터페이스 (의존성 역전)
interface IErrorStoreAdapter {
    setGlobalError(error: Error | ApiError): void;
    clearGlobalError(): void;
    addToastError(message: string): void;
}

// 에러 타입 검증기 클래스 (단일 책임 원칙)
class ErrorTypeChecker implements IErrorTypeChecker {
    isApiError(error: unknown): error is ApiError {
        return typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            'message' in error;
    }

    isStandardError(error: unknown): error is Error {
        return error instanceof Error;
    }
}

// 에러 메시지 처리기 클래스 (단일 책임 원칙)
class ErrorMessageProcessor implements IErrorMessageProcessor {
    private typeChecker: IErrorTypeChecker;

    constructor(typeChecker: IErrorTypeChecker) {
        this.typeChecker = typeChecker;
    }

    formatErrorMessage(error: Error | ApiError): string {
        if (this.typeChecker.isApiError(error)) {
            return `Error ${error.status}: ${error.message}`;
        }
        return error.message;
    }

    createErrorInfo(error: Error | ApiError, context?: string): ErrorInfo {
        return {
            error,
            timestamp: Date.now(),
            context
        };
    }
}

// 에러 로거 클래스 (단일 책임 원칙)
class ErrorLogger implements IErrorLogger {
    private static readonly LOG_PREFIX = '[Error Handler]';

    shouldLog(environment: string): boolean {
        return environment !== 'production';
    }

    logError(errorInfo: ErrorInfo): void {
        if (!this.shouldLog(process.env.NODE_ENV || 'development')) {
            return;
        }

        const logData = {
            error: errorInfo.error,
            timestamp: new Date(errorInfo.timestamp).toISOString(),
            context: errorInfo.context
        };

        console.error(ErrorLogger.LOG_PREFIX, logData);
    }
}

// 에러 스토어 어댑터 클래스 (어댑터 패턴)
class ErrorStoreAdapter implements IErrorStoreAdapter {
    constructor(
        private storeSetGlobalError: (error: Error | ApiError) => void,
        private storeClearGlobalError: () => void,
        private storeAddToastError: (message: string) => void
    ) { }

    setGlobalError(error: Error | ApiError): void {
        this.storeSetGlobalError(error);
    }

    clearGlobalError(): void {
        this.storeClearGlobalError();
    }

    addToastError(message: string): void {
        this.storeAddToastError(message);
    }
}

// 에러 처리 전략 인터페이스
interface IErrorHandlingStrategy {
    handle(error: Error | ApiError, storeAdapter: IErrorStoreAdapter): void;
}

// 글로벌 에러 처리 전략 (전략 패턴)
class GlobalErrorStrategy implements IErrorHandlingStrategy {
    handle(error: Error | ApiError, storeAdapter: IErrorStoreAdapter): void {
        storeAdapter.setGlobalError(error);
    }
}

// 토스트 에러 처리 전략 (전략 패턴)
class ToastErrorStrategy implements IErrorHandlingStrategy {
    constructor(private messageProcessor: IErrorMessageProcessor) { }

    handle(error: Error | ApiError, storeAdapter: IErrorStoreAdapter): void {
        const message = this.messageProcessor.formatErrorMessage(error);
        storeAdapter.addToastError(message);
    }
}

// 에러 처리 팩토리 클래스 (팩토리 패턴)
class ErrorHandlingStrategyFactory {
    constructor(private messageProcessor: IErrorMessageProcessor) { }

    createStrategy(type: ErrorType): IErrorHandlingStrategy {
        switch (type) {
            case 'global':
                return new GlobalErrorStrategy();
            case 'toast':
                return new ToastErrorStrategy(this.messageProcessor);
            default:
                return new ToastErrorStrategy(this.messageProcessor);
        }
    }
}

// 에러 처리 서비스 클래스 (조합 패턴)
class ErrorHandlingService {
    constructor(
        private storeAdapter: IErrorStoreAdapter,
        private strategyFactory: ErrorHandlingStrategyFactory,
        private logger: IErrorLogger,
        private messageProcessor: IErrorMessageProcessor
    ) { }

    handleError(
        error: Error | ApiError,
        options: ErrorHandlerOptions = {}
    ): void {
        const { type = 'toast', shouldLog = true, context } = options;

        // 에러 정보 생성
        const errorInfo = this.messageProcessor.createErrorInfo(error, context);

        // 로깅 처리
        if (shouldLog) {
            this.logger.logError(errorInfo);
        }

        // 에러 처리 전략 실행
        const strategy = this.strategyFactory.createStrategy(type);
        strategy.handle(error, this.storeAdapter);
    }

    clearError(): void {
        this.storeAdapter.clearGlobalError();
    }
}

/**
 * 에러 처리 훅
 * 
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: 각 클래스가 하나의 책임만 담당
 * - 의존성 역전 원칙: 인터페이스 기반 설계
 * - 전략 패턴: 에러 타입별 다른 처리 전략
 * - 팩토리 패턴: 전략 객체 생성 관리
 * - 어댑터 패턴: 외부 스토어와의 연결
 */
export function useErrorHandler() {
    const { setGlobalError, clearGlobalError, addToastError } = useErrorStore();

    // 의존성 주입을 통한 서비스 구성
    const typeChecker = new ErrorTypeChecker();
    const messageProcessor = new ErrorMessageProcessor(typeChecker);
    const logger = new ErrorLogger();
    const storeAdapter = new ErrorStoreAdapter(
        setGlobalError,
        clearGlobalError,
        addToastError
    );
    const strategyFactory = new ErrorHandlingStrategyFactory(messageProcessor);

    const errorService = new ErrorHandlingService(
        storeAdapter,
        strategyFactory,
        logger,
        messageProcessor
    );

    /**
     * 에러 처리 메인 함수
     */
    const handleError = useCallback((
        error: Error | ApiError,
        options?: ErrorHandlerOptions
    ) => {
        errorService.handleError(error, options);
    }, [errorService]);

    /**
     * 특정 타입의 에러 처리 헬퍼 함수들
     */
    const handleGlobalError = useCallback((
        error: Error | ApiError,
        context?: string
    ) => {
        handleError(error, { type: 'global', context });
    }, [handleError]);

    const handleToastError = useCallback((
        error: Error | ApiError,
        context?: string
    ) => {
        handleError(error, { type: 'toast', context });
    }, [handleError]);

    /**
     * 에러 클리어 함수
     */
    const clearError = useCallback(() => {
        errorService.clearError();
    }, [errorService]);

    return {
        handleError,
        handleGlobalError,
        handleToastError,
        clearError
    };
}
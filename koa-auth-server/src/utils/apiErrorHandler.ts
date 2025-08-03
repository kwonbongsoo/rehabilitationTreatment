import { BaseError, ErrorCode } from '@ecommerce/common';
import {
    ApiError, ApiTimeoutError, ApiUnavailableError,
    ApiResponseFormatError, ApiRateLimitError
} from '../middlewares/errorMiddleware';
import { ErrorDetails } from '../interfaces/http';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export class ApiErrorHandler {
    constructor(private readonly serviceName: string) { }

    handleApiError(error: unknown, operation: string): Error {
        if (error instanceof BaseError) {
            return this.handleBaseError(error, operation);
        }

        // 기타 예상치 못한 에러
        console.error(`[${this.serviceName}] Unexpected error in ${operation}:`, error);
        return new ApiError(
            ERROR_MESSAGES.UNEXPECTED,
            500,
            this.serviceName
        );
    }

    private handleBaseError(error: BaseError, operation: string): Error {
        const statusCode = error.statusCode || 500;
        const message = error.message;

        // ErrorCode에 따른 처리
        switch (error.code) {
            case ErrorCode.TIMEOUT_ERROR:
                return new ApiTimeoutError(
                    `${ERROR_MESSAGES.TIMEOUT} (${operation})`,
                    this.serviceName
                );

            case ErrorCode.EXTERNAL_SERVICE_ERROR:
                // HTTP 상태 코드별 처리
                switch (statusCode) {
                    case 429:
                        return new ApiRateLimitError(
                            `${ERROR_MESSAGES.RATE_LIMIT}: ${message}`,
                            this.serviceName
                        );

                    case 401:
                        return new ApiError(
                            ERROR_MESSAGES.INVALID_CREDENTIALS,
                            statusCode,
                            this.serviceName
                        );

                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        return new ApiUnavailableError(
                            `${ERROR_MESSAGES.SERVER_ERROR}: ${message}`,
                            this.serviceName
                        );

                    default:
                        return new ApiError(message, statusCode, this.serviceName);
                }

            case ErrorCode.CONNECTION_ERROR:
                return new ApiUnavailableError(
                    `${ERROR_MESSAGES.CONNECTION_REFUSED} (${operation})`,
                    this.serviceName
                );

            default:
                return new ApiError(message, statusCode, this.serviceName);
        }
    }

    private getDefaultErrorMessage(statusCode: number): string {
        // 상태 코드별 기본 메시지
        switch (statusCode) {
            case 400: return ERROR_MESSAGES.BAD_REQUEST;
            case 401: return ERROR_MESSAGES.UNAUTHORIZED;
            case 403: return ERROR_MESSAGES.FORBIDDEN;
            case 404: return ERROR_MESSAGES.NOT_FOUND;
            case 429: return ERROR_MESSAGES.RATE_LIMIT;
            case 500: return ERROR_MESSAGES.SERVER_ERROR;
            default: return `${statusCode} ${ERROR_MESSAGES.DEFAULT_ERROR}`;
        }
    }
}
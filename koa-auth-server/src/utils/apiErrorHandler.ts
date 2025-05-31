import { HTTPError, RequestError, TimeoutError } from 'got';
import {
    ApiError, ApiTimeoutError, ApiUnavailableError,
    ApiResponseFormatError, ApiRateLimitError
} from '../middlewares/errorMiddleware';
import { ErrorDetails } from '../interfaces/http';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export class ApiErrorHandler {
    constructor(private readonly serviceName: string) { }

    handleApiError(error: unknown, operation: string): Error {
        if (error instanceof TimeoutError) {
            return new ApiTimeoutError(
                `${ERROR_MESSAGES.TIMEOUT} (${operation})`,
                this.serviceName
            );
        }

        if (error instanceof HTTPError) {
            return this.handleHttpError(error, operation);
        }

        if (error instanceof RequestError) {
            return this.handleRequestError(error, operation);
        }

        // 기타 예상치 못한 에러
        console.error(`[${this.serviceName}] Unexpected error in ${operation}:`, error);
        return new ApiError(
            ERROR_MESSAGES.UNEXPECTED,
            500,
            this.serviceName
        );
    }

    private handleHttpError(error: HTTPError, operation: string): Error {
        const statusCode = error.response.statusCode;
        const message = this.extractErrorMessage(error);

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

            // 다른 상태 코드 처리...

            default:
                return new ApiError(message, statusCode, this.serviceName);
        }
    }

    private handleRequestError(error: RequestError, operation: string): Error {
        if (error.code === 'ECONNREFUSED') {
            return new ApiUnavailableError(
                `${ERROR_MESSAGES.CONNECTION_REFUSED} (${operation})`,
                this.serviceName
            );
        }

        return new ApiError(
            `${ERROR_MESSAGES.REQUEST_ERROR}: ${error.message}`,
            500,
            this.serviceName
        );
    }

    private extractErrorMessage(error: HTTPError): string {
        try {
            const body = error.response.body;
            if (typeof body === 'object' && body !== null && 'message' in body) {
                return body.message as string;
            }
        } catch (e) {
            // 메시지 추출 중 오류 발생 시 기본 메시지 사용
        }

        return this.getDefaultErrorMessage(error.response.statusCode);
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
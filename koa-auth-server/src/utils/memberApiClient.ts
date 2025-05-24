import got, { HTTPError, Got } from 'got';
import { TokenPayload } from '../interfaces/auth';
import { ApiError, ApiUnavailableError, ApiResponseFormatError } from '../middlewares/errorMiddleware';
import { Config } from '../config/config';

// HTTP 상태 코드 정의
const HTTP_STATUS = {
    // 성공 응답
    OK: 200,                    // 요청 성공
    CREATED: 201,               // 리소스 생성 성공
    ACCEPTED: 202,              // 요청 접수 (처리는 나중에)
    NO_CONTENT: 204,            // 성공했지만 반환할 콘텐츠 없음

    // 클라이언트 오류
    BAD_REQUEST: 400,           // 잘못된 요청 구문
    UNAUTHORIZED: 401,          // 인증 필요
    FORBIDDEN: 403,             // 권한 없음
    NOT_FOUND: 404,             // 리소스를 찾을 수 없음
    CONFLICT: 409,              // 리소스 충돌 (중복 등)
    UNPROCESSABLE: 422,         // 잘못된 요청 데이터

    // 서버 오류
    INTERNAL_SERVER: 500,       // 내부 서버 오류
    NOT_IMPLEMENTED: 501,       // 구현되지 않은 기능
    BAD_GATEWAY: 502,           // 게이트웨이 오류
    SERVICE_UNAVAILABLE: 503,   // 서비스 일시적 사용 불가
    GATEWAY_TIMEOUT: 504,       // 게이트웨이 타임아웃

    // 재시도 가능한 상태 코드 모음
    RETRYABLE: [408, 429, 500, 502, 503, 504] as const
};

/**
 * Member API와의 통신을 전담하는 클래스
 * Auth 서버에 필요한 인증 관련 기능만 제공합니다.
 */
export class MemberApiClient {
    private api: Got;
    private config: Config;

    /**
     * MemberApiClient 생성자
     * @param config 설정 객체 (의존성 주입)
     */
    constructor(config?: Config) {
        this.config = config || new Config();

        // 설정에서 URL 및 타임아웃 가져오기
        const memberServiceUrl = this.config.getMemberServiceUrl();
        const memberServiceTimeout = this.config.getMemberServiceTimeout();

        // Got 인스턴스 생성
        this.api = got.extend({
            prefixUrl: memberServiceUrl,
            timeout: {
                request: memberServiceTimeout
            },
            headers: {
                'content-type': 'application/json',
                'user-agent': 'koa-auth-server'
            },
            retry: {
                limit: 2,
                methods: ['GET', 'POST', 'PUT'],
                statusCodes: [408, 429, 500, 502, 503, 504]
            },
            responseType: 'json',
            // hooks
            hooks: {
                // 에러 발생 전 처리
                beforeError: [
                    error => {
                        const { response } = error;
                        if (response?.body) {
                            if (typeof response.body === 'object' && response.body !== null) {
                                error.name = 'MemberApiError';
                                const bodyWithMessage = response.body as { message?: string };
                                error.message = bodyWithMessage.message ||
                                    `${response.statusCode} - ${response.statusMessage}`;
                            }
                        }

                        // 개발 모드에서는 상세 에러 로깅
                        if (process.env.NODE_ENV !== 'production') {
                            console.error(`[MemberAPI Error] ${error.message}`, {
                                url: error.options?.url?.toString(),
                                method: error.options?.method,
                                statusCode: response?.statusCode
                            });
                        }

                        return error;
                    }
                ],

                // 응답 수신 후 처리
                afterResponse: [
                    (response, retryWithMergedOptions) => {
                        // 응답 헤더 분석 또는 로깅
                        const requestId = response.headers['x-request-id'];
                        if (requestId && process.env.NODE_ENV !== 'production') {
                            console.log(`[MemberAPI] Request ID: ${requestId}, Status: ${response.statusCode}`);
                        }

                        // 특정 상태 코드에 대한 특별 처리
                        if (response.statusCode === 429) { // 요청 제한 초과
                            // 헤더에서 대기 시간 가져오기
                            const retryAfter = response.headers['retry-after'];
                            const retryAfterMS = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

                            // 재시도 지연 시간을 늘려서 재시도
                            const updatedOptions = {
                                retry: {
                                    calculateDelay: () => retryAfterMS
                                }
                            };

                            // retryWithMergedOptions를 사용하여 옵션을 병합하고 재시도
                            return retryWithMergedOptions(updatedOptions);
                        }

                        // 특정 헤더나 본문 변환이 필요한 경우
                        if (response.headers['content-type']?.includes('application/json')) {
                            // 필요하다면 여기서 본문 추가 처리
                            // 예: 표준화된 응답 형식으로 변환
                        }

                        // 응답 그대로 반환
                        return response;
                    }
                ]
            }
        });
    }

    /**
     * 사용자 자격 증명을 검증합니다.
     * @param id 사용자 아이디
     * @param password 사용자 비밀번호
     */
    public async verifyCredentials(id: string, password: string): Promise<TokenPayload> {
        try {
            const response = await this.api.post('member/verify', {
                json: { id, password }
            });

            if (
                response.body &&
                typeof response.body === 'object' &&
                this.isTokenPayload(response.body)
            ) {
                return response.body;
            }

            // API 응답 형식 오류 - errorMiddleware에 정의된 ApiResponseFormatError 사용
            throw new ApiResponseFormatError(
                '서버 응답 형식이 올바르지 않습니다',
                'member-service'
            );
        } catch (error) {
            if (error instanceof HTTPError) {
                // HTTP 에러 (4xx, 5xx) 처리
                const statusCode = error.response.statusCode;
                const message = this.extractErrorMessage(error);

                // 상태 코드별 특별 처리 - errorMiddleware의 ApiError 사용
                switch (statusCode) {
                    case HTTP_STATUS.UNAUTHORIZED: // 401: 잘못된 자격 증명
                        throw new ApiError(
                            '아이디 또는 비밀번호가 올바르지 않습니다',
                            statusCode,
                            'member-service'
                        );

                    case HTTP_STATUS.FORBIDDEN: // 403: 사용자가 접근 권한이 없음
                        throw new ApiError(
                            '계정에 대한 접근 권한이 없습니다',
                            statusCode,
                            'member-service'
                        );

                    case HTTP_STATUS.NOT_FOUND: // 404: 사용자를 찾을 수 없음
                        throw new ApiError(
                            '등록되지 않은 계정입니다',
                            statusCode,
                            'member-service'
                        );

                    default:
                        // 그 외 모든 상태코드도 ApiError로 변환
                        throw new ApiError(
                            message,
                            statusCode,
                            'member-service'
                        );
                }
            }

            // 네트워크 오류 등 - errorMiddleware의 ApiUnavailableError 사용
            throw new ApiUnavailableError(
                '멤버 서비스에 접속할 수 없습니다',
                'member-service'
            );
        }
    }

    /**
     * 객체가 TokenPayload 형식인지 확인하는 타입 가드
     */
    private isTokenPayload(obj: unknown): obj is TokenPayload {
        return (
            obj !== null &&
            typeof obj === 'object' &&
            'id' in obj &&
            typeof obj.id === 'string' &&
            'role' in obj &&
            typeof obj.role === 'string' &&
            'name' in obj &&
            typeof obj.name === 'string'
        );
    }

    /**
     * 에러 객체에서 적절한 메시지를 추출합니다.
     */
    private extractErrorMessage(error: any): string {
        if (error instanceof HTTPError) {
            // body가 객체인지 확인
            if (typeof error.response.body === 'object' && error.response.body !== null) {
                // 타입 단언을 사용해 안전하게 message 속성 접근
                const bodyWithMessage = error.response.body as { message?: string };
                if (bodyWithMessage.message) {
                    return bodyWithMessage.message;
                }
            }

            // 상태 코드별 기본 메시지
            switch (error.response.statusCode) {
                case HTTP_STATUS.BAD_REQUEST:  // 400
                    return '잘못된 요청입니다';

                case HTTP_STATUS.UNAUTHORIZED: // 401
                    return '인증이 필요합니다';

                case HTTP_STATUS.FORBIDDEN:    // 403
                    return '권한이 없습니다';

                case HTTP_STATUS.NOT_FOUND:    // 404
                    return '요청한 리소스를 찾을 수 없습니다';

                case HTTP_STATUS.CONFLICT:     // 409
                    return '리소스 충돌이 발생했습니다 (중복된 데이터)';

                case HTTP_STATUS.INTERNAL_SERVER: // 500
                    return '서버 내부 오류가 발생했습니다';

                case HTTP_STATUS.SERVICE_UNAVAILABLE: // 503
                    return '서비스를 일시적으로 사용할 수 없습니다';

                default:
                    return `${error.response.statusCode} - ${error.response.statusMessage}`;
            }
        }

        return error.message || '알 수 없는 오류가 발생했습니다';
    }
}

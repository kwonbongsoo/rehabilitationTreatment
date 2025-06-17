import got, { HTTPError, Got, RequestError, TimeoutError } from 'got';
import { UserInfo } from '../interfaces/auth';
import { MemberResponse } from '../interfaces/member';
import {
  ApiError,
  ApiTimeoutError,
  ApiUnavailableError,
  ApiResponseFormatError,
  ApiRateLimitError,
  ApiForbiddenError,
  ApiNotFoundError,
  ApiAuthenticationError,
} from '../middlewares/errorMiddleware';
import { Config } from '../config/config';

// HTTP 상태 코드 정의

// // 성공 응답
// OK: 200,                    // 요청 성공
// CREATED: 201,               // 리소스 생성 성공
// ACCEPTED: 202,              // 요청 접수 (처리는 나중에)
// NO_CONTENT: 204,            // 성공했지만 반환할 콘텐츠 없음

// // 클라이언트 오류
// BAD_REQUEST: 400,           // 잘못된 요청 구문
// UNAUTHORIZED: 401,          // 인증 필요
// FORBIDDEN: 403,             // 권한 없음
// NOT_FOUND: 404,             // 리소스를 찾을 수 없음
// CONFLICT: 409,              // 리소스 충돌 (중복 등)
// UNPROCESSABLE: 422,         // 잘못된 요청 데이터

// // 서버 오류
// INTERNAL_SERVER: 500,       // 내부 서버 오류
// NOT_IMPLEMENTED: 501,       // 구현되지 않은 기능
// BAD_GATEWAY: 502,           // 게이트웨이 오류
// SERVICE_UNAVAILABLE: 503,   // 서비스 일시적 사용 불가
// GATEWAY_TIMEOUT: 504,       // 게이트웨이 타임아웃

/**
 * Member API와의 통신을 전담하는 클래스
 * got 라이브러리 활용 및 에러 핸들러 통합
 */
export class MemberApiClient {
  private api: Got;
  private readonly SERVICE_NAME = 'member-service';
  private static instance: MemberApiClient;

  constructor(config?: Config) {
    const configInstance = config || new Config();
    const memberServiceUrl = configInstance.getMemberServiceUrl();
    const memberServiceTimeout = configInstance.getMemberServiceTimeout();

    this.api = got.extend({
      prefixUrl: memberServiceUrl,
      timeout: {
        request: memberServiceTimeout,
      },
      headers: {
        'content-type': 'application/json',
        'user-agent': 'koa-auth-server',
      },
      retry: {
        limit: 2,
        methods: ['GET', 'POST', 'PUT'],
        statusCodes: [408, 429, 500, 502, 503, 504],
      },
      responseType: 'json',
    });
  }

  public static getInstance(config?: Config): MemberApiClient {
    if (!MemberApiClient.instance) {
      MemberApiClient.instance = new MemberApiClient(config);
    }
    return MemberApiClient.instance;
  }

  /**
   * 사용자 자격 증명을 검증합니다.
   * @throws {ApiError} API 요청 실패 시
   */
  public async verifyCredentials(id: string, password: string): Promise<UserInfo> {
    try {
      const {
        body: { member },
      } = await this.api.post<MemberResponse>('api/members/verify', {
        json: { id, password },
      });

      return {
        id: member.id,
        email: member.email,
        name: member.name,
      };
    } catch (error) {
      throw this.handleApiError(error, 'verifyCredentials');
    }
  }

  /**
   * got 에러를 비즈니스 에러로 변환하는 헬퍼 메서드
   * @private
   */
  private handleApiError(error: unknown, operation: string): Error {
    // got의 TimeoutError 처리
    if (error instanceof TimeoutError) {
      return new ApiTimeoutError(`요청 시간이 초과되었습니다 (${operation})`, this.SERVICE_NAME);
    }

    // got의 HTTP 에러 처리
    if (error instanceof HTTPError) {
      const statusCode = error.response.statusCode;
      let message = this.getErrorMessage(error);

      // HTTP 상태 코드별 처리
      switch (statusCode) {
        case 429:
          return new ApiRateLimitError(`요청 한도를 초과했습니다: ${message}`, this.SERVICE_NAME);

        case 401:
          return new ApiAuthenticationError(
            '아이디 또는 비밀번호가 올바르지 않습니다',
            this.SERVICE_NAME,
          );
        case 403:
          return new ApiForbiddenError('권한이 없습니다', this.SERVICE_NAME);
        case 404:
          return new ApiNotFoundError('등록되지 않은 계정입니다', this.SERVICE_NAME);

        // 서버 오류
        case 500:
        case 502:
        case 503:
        case 504:
          return new ApiUnavailableError(
            `서비스를 일시적으로 사용할 수 없습니다: ${message}`,
            this.SERVICE_NAME,
          );

        default:
          return new ApiError(message, statusCode, this.SERVICE_NAME);
      }
    }

    // got의 RequestError (네트워크 문제 등)
    if (error instanceof RequestError) {
      if (error.code === 'ECONNREFUSED') {
        return new ApiUnavailableError(
          `서비스에 연결할 수 없습니다 (${operation})`,
          this.SERVICE_NAME,
        );
      }

      return new ApiError(`API 요청 오류: ${error.message}`, 500, this.SERVICE_NAME);
    }

    // 기타 예상치 못한 에러
    console.error(`[MemberAPI] Unexpected error in ${operation}:`, error);
    return new ApiError('예상치 못한 오류가 발생했습니다', 500, this.SERVICE_NAME);
  }

  /**
   * 에러 객체에서 사용자 친화적인 메시지 추출
   */
  private getErrorMessage(error: HTTPError): string {
    try {
      // body가 객체인지 확인
      const body = error.response.body;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        return body.message as string;
      }
    } catch (e) {
      // 메시지 추출 중 오류 발생 시 기본 메시지 사용
    }

    // 상태 코드별 기본 메시지
    switch (error.response.statusCode) {
      case 400:
        return '잘못된 요청입니다';
      case 401:
        return '인증이 필요합니다';
      case 403:
        return '권한이 없습니다';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다';
      case 429:
        return '너무 많은 요청을 보냈습니다';
      case 500:
        return '서버 내부 오류가 발생했습니다';
      default:
        return `${error.response.statusCode} 오류가 발생했습니다`;
    }
  }

  /**
   * 객체가 MemberPayload 형식인지 확인하는 타입 가드
   */
  private isMemberResponse(obj: unknown): obj is MemberResponse {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'success' in obj &&
      obj.success === true &&
      'member' in obj &&
      typeof obj.member === 'object' &&
      obj.member !== null &&
      'id' in obj.member &&
      typeof obj.member.id === 'string' &&
      'email' in obj.member &&
      typeof obj.member.email === 'string' &&
      'name' in obj.member &&
      typeof obj.member.name === 'string'
    );
  }
}

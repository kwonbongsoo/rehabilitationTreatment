import { HttpClient, BaseError, ErrorCode } from '@ecommerce/common';
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
  ApiInvalidCredentialsError,
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
 * @ecommerce/common HttpClient 활용 및 에러 핸들러 통합
 */
export class MemberApiClient {
  private httpClient: HttpClient;
  private readonly SERVICE_NAME = 'member-service';
  private static instance: MemberApiClient;

  constructor(config?: Config) {
    const configInstance = config || new Config();
    const memberServiceUrl = configInstance.getMemberServiceUrl();
    const memberServiceTimeout = configInstance.getMemberServiceTimeout();

    this.httpClient = new HttpClient(memberServiceUrl, {
      timeout: memberServiceTimeout,
      headers: {
        'User-Agent': 'koa-auth-server',
      },
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
      const response = await this.httpClient.post<MemberResponse>('api/members/verify', {
        id,
        password,
      });

      // 응답 구조 검증
      if (!this.isMemberResponse(response)) {
        console.error(`[MemberAPI] Invalid response format:`, response);
        throw new ApiResponseFormatError(
          'Invalid response format from member service',
          this.SERVICE_NAME,
        );
      }

      const member = response.data;

      return {
        id: member.id,
        email: member.email,
        name: member.name,
      };
    } catch (error) {
      console.error(`[MemberAPI] Error in verifyCredentials:`, error);
      console.error(`[MemberAPI] Error type:`, error?.constructor?.name);
      console.error(`[MemberAPI] Error message:`, (error as any)?.message);
      console.error(`[MemberAPI] Error code:`, (error as any)?.code);

      if (error instanceof BaseError) {
        console.error(`[MemberAPI] BaseError status:`, error.statusCode);
        console.error(`[MemberAPI] BaseError context:`, error.details);
      }

      throw this.handleApiError(error, 'verifyCredentials');
    }
  }

  /**
   * HttpClient 에러를 비즈니스 에러로 변환하는 헬퍼 메서드
   * @private
   */
  private handleApiError(error: unknown, operation: string): Error {
    // BaseError (공통 HttpClient 에러) 처리
    if (error instanceof BaseError) {
      const statusCode = error.statusCode || 500;
      let message = error.message;

      // ErrorCode에 따른 처리
      switch (error.code) {
        case ErrorCode.TIMEOUT_ERROR:
          return new ApiTimeoutError(
            `요청 시간이 초과되었습니다 (${operation})`,
            this.SERVICE_NAME,
          );

        case ErrorCode.EXTERNAL_SERVICE_ERROR:
          // HTTP 상태 코드별 처리
          switch (statusCode) {
            case 429:
              return new ApiRateLimitError(
                `요청 한도를 초과했습니다: ${message}`,
                this.SERVICE_NAME,
              );

            case 401:
              return new ApiAuthenticationError(
                '아이디 또는 비밀번호가 올바르지 않습니다',
                this.SERVICE_NAME,
              );
            case 403:
              return new ApiForbiddenError('권한이 없습니다', this.SERVICE_NAME);
            case 404:
              return new ApiNotFoundError('등록되지 않은 계정입니다', this.SERVICE_NAME);
            case 422:
              return new ApiInvalidCredentialsError(
                '아이디 또는 비밀번호가 올바르지 않습니다',
                this.SERVICE_NAME,
              );
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

        case ErrorCode.CONNECTION_ERROR:
          return new ApiUnavailableError(
            `서비스에 연결할 수 없습니다 (${operation})`,
            this.SERVICE_NAME,
          );

        default:
          return new ApiError(message, statusCode, this.SERVICE_NAME);
      }
    }

    // 일반 Error 객체 처리
    if (error instanceof Error) {
      return new ApiError(`API 오류: ${error.message}`, 500, this.SERVICE_NAME);
    }

    // 기타 예상치 못한 에러
    return new ApiError('예상치 못한 오류가 발생했습니다', 500, this.SERVICE_NAME);
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
      'data' in obj &&
      typeof obj.data === 'object' &&
      obj.data !== null &&
      'id' in obj.data &&
      typeof obj.data.id === 'string' &&
      'email' in obj.data &&
      typeof obj.data.email === 'string' &&
      'name' in obj.data &&
      typeof obj.data.name === 'string'
    );
  }
}

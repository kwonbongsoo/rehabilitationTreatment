import dotenv from 'dotenv';
import { EnvValidator } from '@ecommerce/common';

dotenv.config();

// 환경변수 검증
EnvValidator.validate({
  required: [
    'JWT_SECRET',
    'REDIS_URL',
    'REDIS_PASSWORD',
    'MEMBER_SERVICE_URL',
    'AUTH_BASIC_KEY'
  ],
  optional: {
    'NODE_ENV': 'development',
    'PORT': '4000',
    'REDIS_PORT': '6379',
    'JWT_EXPIRES_IN': '3600',
    'MEMBER_SERVICE_TIMEOUT': '3000'
  },
  production: [
    'NODE_ENV' // 프로덕션에서는 NODE_ENV가 반드시 설정되어야 함
  ]
});

// 보안 중요 환경변수 추가 검증
EnvValidator.validateSecret('JWT_SECRET', 32);
EnvValidator.validateSecret('AUTH_BASIC_KEY', 16);
if (process.env.MEMBER_SERVICE_URL) {
  EnvValidator.validateUrl('MEMBER_SERVICE_URL');
}
if (process.env.PORT) {
  EnvValidator.validateNumber('PORT', 1, 65535);
}
if (process.env.REDIS_PORT) {
  EnvValidator.validateNumber('REDIS_PORT', 1, 65535);
}

/**
 * 애플리케이션 설정을 관리하는 클래스
 * 환경 변수에 대한 접근을 캡슐화하고 기본값 및 유효성 검증 제공
 */
export class Config {
  /**
   * JWT 토큰 서명에 사용되는 비밀 키를 반환
   * @returns JWT 비밀 키
   * @throws 환경 변수가 설정되지 않은 경우 에러 발생
   */
  public getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다');
    }
    return secret;
  }

  /**
   * JWT 토큰의 만료 시간(초)을 반환
   * @returns 만료 시간(초)
   */
  public getJwtExpiresIn(): number {
    return parseInt(process.env.JWT_EXPIRES_IN || '3600', 10);
  }

  /**
   * JWT 토큰 발급 시간 정보를 계산하여 반환
   * @returns 토큰 발급 관련 시간 정보 객체
   */
  public getTokenTimingConfig(): {
    issuedAt: number;
    expiresAt: number;
  } {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.getJwtExpiresIn();

    return {
      issuedAt: now,
      expiresAt: now + expiresIn,
    };
  }

  /**
   * 개발 환경인지 여부를 반환
   * @returns 개발 환경 여부
   */
  public isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * 멤버 서비스 URL을 반환
   * @returns 멤버 서비스 URL
   */
  public getMemberServiceUrl(): string {
    const url = process.env.MEMBER_SERVICE_URL;
    if (!url) {
      throw new Error('MEMBER_SERVICE_URL 환경 변수가 설정되지 않았습니다');
    }
    return url;
  }

  /**
   * 멤버 서비스 타임아웃 값(ms)을 반환
   * @returns 타임아웃 값(ms)
   */
  public getMemberServiceTimeout(): number {
    return Number.parseInt(process.env.MEMBER_SERVICE_TIMEOUT ?? '3000', 10);
  }

  /**
   * 서버 포트 번호를 반환
   * @returns 포트 번호
   */
  public getPort(): number {
    return Number.parseInt(process.env.PORT ?? '3000', 10);
  }

  /**
   * Redis 연결 URL을 반환
   * @returns Redis URL
   */
  public getRedisUrl(): string {
    const host = process.env.REDIS_URL;
    if (!host) {
      throw new Error('REDIS_URL 환경 변수가 설정되지 않았습니다');
    }
    return host;
  }

  /**
   * Redis 포트 반환
   */
  public getRedisPort(): number {
    return parseInt(process.env.REDIS_PORT || '6379');
  }

  /**
   * Redis 비밀번호 반환 (설정된 경우)
   */
  public getRedisPassword(): string | undefined {
    return process.env.REDIS_PASSWORD;
  }

  /**
   * Redis 연결 설정 전체를 객체로 반환
   */
  public getRedisConfig(): {
    host: string;
    port: number;
    password?: string;
    retryStrategy?: (times: number) => number | null;
  } {
    const config: {
      host: string;
      port: number;
      password?: string;
      retryStrategy?: (times: number) => number | null;
    } = {
      host: this.getRedisUrl(),
      port: this.getRedisPort(),
    };

    const password = this.getRedisPassword();
    if (password) {
      config.password = password;
    }

    config.retryStrategy = (times: number) => {
      const delay = Math.min(times * 500, 3000);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Redis 연결 재시도... (${times}번째 시도, ${delay}ms 후)`);
      }
      return delay;
    };

    return config;
  }
}

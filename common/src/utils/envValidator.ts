/**
 * 환경변수 검증 유틸리티
 * 필수 환경변수가 설정되었는지 확인하고 보안 강화
 */

export interface EnvConfig {
  /** 필수 환경변수 목록 */
  required?: string[];
  /** 선택적 환경변수와 기본값 */
  optional?: Record<string, string>;
  /** 환경별 필수 환경변수 */
  production?: string[];
  development?: string[];
}

export class EnvValidationError extends Error {
  constructor(message: string, public missingVars: string[]) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

export class EnvValidator {
  /**
   * 환경변수 검증 및 설정
   */
  static validate(config: EnvConfig): void {
    const missingVars: string[] = [];
    const currentEnv = process.env.NODE_ENV || 'development';

    // 공통 필수 환경변수 검증
    if (config.required) {
      config.required.forEach(key => {
        if (!process.env[key] || process.env[key]?.trim() === '') {
          missingVars.push(key);
        }
      });
    }

    // 환경별 필수 환경변수 검증
    const envSpecific = config[currentEnv as keyof EnvConfig] as string[];
    if (envSpecific) {
      envSpecific.forEach(key => {
        if (!process.env[key] || process.env[key]?.trim() === '') {
          missingVars.push(key);
        }
      });
    }

    // 누락된 환경변수가 있으면 에러 발생
    if (missingVars.length > 0) {
      const errorMessage = `필수 환경변수가 설정되지 않았습니다: ${missingVars.join(', ')}`;
      
      if (currentEnv === 'production') {
        // 프로덕션에서는 보안상 변수명 마스킹
        console.error('필수 환경변수 누락으로 서버 시작 실패');
      } else {
        console.error(errorMessage);
      }
      
      throw new EnvValidationError(errorMessage, missingVars);
    }

    // 선택적 환경변수 기본값 설정
    if (config.optional) {
      Object.entries(config.optional).forEach(([key, defaultValue]) => {
        if (!process.env[key]) {
          process.env[key] = defaultValue;
        }
      });
    }

    // 검증 완료 로그 (개발환경에서만)
    if (currentEnv !== 'production') {
      console.log('✅ 환경변수 검증 완료');
    }
  }

  /**
   * 특정 환경변수 값 검증 (패턴 매칭)
   */
  static validatePattern(key: string, pattern: RegExp, errorMessage?: string): void {
    const value = process.env[key];
    if (value && !pattern.test(value)) {
      const error = errorMessage || `환경변수 ${key}가 올바른 형식이 아닙니다`;
      throw new EnvValidationError(error, [key]);
    }
  }

  /**
   * 환경변수 값이 허용된 값 목록에 있는지 검증
   */
  static validateEnum(key: string, allowedValues: string[], errorMessage?: string): void {
    const value = process.env[key];
    if (value && !allowedValues.includes(value)) {
      const error = errorMessage || `환경변수 ${key}는 다음 값 중 하나여야 합니다: ${allowedValues.join(', ')}`;
      throw new EnvValidationError(error, [key]);
    }
  }

  /**
   * 숫자 형태의 환경변수 검증
   */
  static validateNumber(key: string, min?: number, max?: number): void {
    const value = process.env[key];
    if (value) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        throw new EnvValidationError(`환경변수 ${key}는 숫자여야 합니다`, [key]);
      }
      if (min !== undefined && numValue < min) {
        throw new EnvValidationError(`환경변수 ${key}는 ${min} 이상이어야 합니다`, [key]);
      }
      if (max !== undefined && numValue > max) {
        throw new EnvValidationError(`환경변수 ${key}는 ${max} 이하여야 합니다`, [key]);
      }
    }
  }

  /**
   * URL 형태의 환경변수 검증
   */
  static validateUrl(key: string): void {
    const value = process.env[key];
    if (value) {
      try {
        new URL(value);
      } catch {
        throw new EnvValidationError(`환경변수 ${key}는 올바른 URL 형식이어야 합니다`, [key]);
      }
    }
  }

  /**
   * 보안에 민감한 환경변수 검증 (최소 길이, 복잡성)
   */
  static validateSecret(key: string, minLength: number = 32): void {
    const value = process.env[key];
    if (value) {
      if (value.length < minLength) {
        throw new EnvValidationError(`환경변수 ${key}는 최소 ${minLength}자 이상이어야 합니다`, [key]);
      }
      
      // 약한 비밀키 패턴 검증
      const weakPatterns = [
        /^(password|secret|key|token)$/i,
        /^(123|abc|test|admin|default)/i,
        /^(.)\1{7,}$/, // 같은 문자 8개 이상 반복
      ];
      
      if (weakPatterns.some(pattern => pattern.test(value))) {
        throw new EnvValidationError(`환경변수 ${key}가 보안에 취약합니다. 더 강력한 값을 사용하세요`, [key]);
      }
    }
  }
}
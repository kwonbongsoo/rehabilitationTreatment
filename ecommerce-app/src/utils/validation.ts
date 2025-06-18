/**
 * 공통 검증 유틸리티
 *
 * 프로젝트 전반에서 사용되는 검증 로직을 중앙화
 * - 이메일, 비밀번호, 아이디 등 공통 검증 규칙
 * - 일관된 에러 메시지 제공
 * - 확장 가능한 검증 시스템
 */

/**
 * 검증 결과 인터페이스
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 필드별 검증 결과
 */
export interface FieldValidationResult {
  [fieldName: string]: ValidationResult;
}

/**
 * 검증 규칙 인터페이스
 */
export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

/**
 * 이메일 검증 클래스
 */
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static validate(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email?.trim()) {
      errors.push('이메일 주소를 입력해주세요.');
    } else if (!this.EMAIL_REGEX.test(email.trim())) {
      errors.push('올바른 이메일 형식을 입력해주세요.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isValid(email: string): boolean {
    return this.validate(email).isValid;
  }

  static getErrors(email: string): string[] {
    return this.validate(email).errors;
  }
}

/**
 * 비밀번호 검증 클래스
 */
export class PasswordValidator {
  static validate(password: string, minLength: number = 8): ValidationResult {
    const errors: string[] = [];

    if (!password?.trim()) {
      errors.push('비밀번호를 입력해주세요.');
    } else {
      if (password.length < minLength) {
        errors.push(`비밀번호는 ${minLength}자 이상이어야 합니다.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateStrength(password: string): {
    score: number; // 0-5
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 2) {
      feedback.push('비밀번호가 너무 약합니다.');
    } else if (score < 3) {
      feedback.push('비밀번호 강도가 보통입니다.');
    } else if (score < 4) {
      feedback.push('비밀번호 강도가 좋습니다.');
    } else {
      feedback.push('비밀번호 강도가 매우 좋습니다.');
    }

    if (password.length < 12) {
      feedback.push('12자 이상 사용하시면 더 안전합니다.');
    }

    return {
      score,
      feedback,
      isStrong: score >= 3,
    };
  }

  static validateConfirmation(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = [];

    if (!confirmPassword?.trim()) {
      errors.push('비밀번호 확인을 입력해주세요.');
    } else if (password !== confirmPassword) {
      errors.push('비밀번호가 일치하지 않습니다.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 아이디 검증 클래스
 */
export class IdValidator {
  private static readonly ID_REGEX = /^[a-zA-Z0-9_-]+$/;

  static validate(id: string, minLength: number = 4): ValidationResult {
    const errors: string[] = [];

    if (!id?.trim()) {
      errors.push('아이디를 입력해주세요.');
    } else {
      if (id.trim().length < minLength) {
        errors.push(`아이디는 ${minLength}자 이상이어야 합니다.`);
      }
      if (!this.ID_REGEX.test(id.trim())) {
        errors.push('아이디는 영문, 숫자, _, - 만 사용할 수 있습니다.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 이름 검증 클래스
 */
export class NameValidator {
  static validate(name: string, minLength: number = 2): ValidationResult {
    const errors: string[] = [];

    if (!name?.trim()) {
      errors.push('이름을 입력해주세요.');
    } else if (name.trim().length < minLength) {
      errors.push(`이름은 ${minLength}자 이상이어야 합니다.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 전화번호 검증 클래스
 */
export class PhoneValidator {
  private static readonly PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

  static validate(phone: string, required: boolean = false): ValidationResult {
    const errors: string[] = [];

    if (!phone?.trim()) {
      if (required) {
        errors.push('전화번호를 입력해주세요.');
      }
    } else if (!this.PHONE_REGEX.test(phone.replace(/-/g, ''))) {
      errors.push('올바른 전화번호 형식을 입력해주세요.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 범용 검증 유틸리티
 */
export class ValidationUtils {
  /**
   * 필수 필드 검증
   */
  static required(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName}을(를) 입력해주세요.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 최소 길이 검증
   */
  static minLength(value: string, minLength: number, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (value && value.length < minLength) {
      errors.push(`${fieldName}은(는) ${minLength}자 이상이어야 합니다.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 최대 길이 검증
   */
  static maxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (value && value.length > maxLength) {
      errors.push(`${fieldName}은(는) ${maxLength}자 이하여야 합니다.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 정규식 패턴 검증
   */
  static pattern(value: string, pattern: RegExp, message: string): ValidationResult {
    const errors: string[] = [];

    if (value && !pattern.test(value)) {
      errors.push(message);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 여러 검증 규칙 조합
   */
  static combineValidations(...validations: ValidationResult[]): ValidationResult {
    const allErrors = validations.flatMap((v) => v.errors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * 객체의 여러 필드 검증
   */
  static validateFields<T extends Record<string, any>>(
    data: T,
    validators: { [K in keyof T]?: (value: T[K]) => ValidationResult },
  ): FieldValidationResult {
    const results: FieldValidationResult = {};

    for (const [field, validator] of Object.entries(validators)) {
      if (validator) {
        results[field] = validator(data[field]);
      }
    }

    return results;
  }

  /**
   * 폼 전체 검증 (모든 필드의 에러를 하나의 배열로)
   */
  static validateForm<T extends Record<string, any>>(
    data: T,
    validators: { [K in keyof T]?: (value: T[K]) => ValidationResult },
  ): ValidationResult {
    const fieldResults = this.validateFields(data, validators);
    const allErrors = Object.values(fieldResults).flatMap((result) => result.errors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}

/**
 * 회원가입 폼 검증
 */
export const validateRegisterForm = (formData: {
  id: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
}): ValidationResult => {
  return ValidationUtils.validateForm(formData, {
    id: (value) => IdValidator.validate(value, 4),
    name: (value) => NameValidator.validate(value, 2),
    email: (value) => EmailValidator.validate(value),
    password: (value) => PasswordValidator.validate(value, 8),
    confirmPassword: (value) => PasswordValidator.validateConfirmation(formData.password, value),
  });
};

/**
 * 로그인 폼 검증
 */
export const validateLoginForm = (formData: { id: string; password: string }): ValidationResult => {
  return ValidationUtils.validateForm(formData, {
    id: (value) => ValidationUtils.required(value, '아이디'),
    password: (value) => ValidationUtils.required(value, '비밀번호'),
  });
};

/**
 * 비밀번호 찾기 폼 검증
 */
export const validateForgotPasswordForm = (formData: { email: string }): ValidationResult => {
  return ValidationUtils.validateForm(formData, {
    email: (value) => EmailValidator.validate(value),
  });
};

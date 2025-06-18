/**
 * 검증 서비스 (Application Layer)
 *
 * 애플리케이션 레벨의 검증 로직을 관리합니다.
 * 도메인 검증 규칙과 사용자 입력 검증을 결합합니다.
 */

import {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  ValidationResult,
  FieldValidationResult,
} from '@/utils/validation';

/**
 * 로그인 폼 데이터 인터페이스
 */
export interface LoginFormData {
  id: string;
  password: string;
}

/**
 * 회원가입 폼 데이터 인터페이스
 */
export interface RegisterFormData {
  id: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
}

/**
 * 비밀번호 찾기 폼 데이터 인터페이스
 */
export interface ForgotPasswordFormData {
  email: string;
}

/**
 * 검증 서비스 클래스
 */
export class ValidationService {
  /**
   * 로그인 자격 증명 검증
   */
  validateLoginCredentials(credentials: LoginFormData): ValidationResult {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!credentials.id?.trim()) {
      errors.push('아이디를 입력해주세요.');
    } else {
      // 아이디 형식 검증
      const idResult = IdValidator.validate(credentials.id, 3);
      if (!idResult.isValid) {
        errors.push(...idResult.errors);
      }
    }

    if (!credentials.password?.trim()) {
      errors.push('비밀번호를 입력해주세요.');
    } else {
      // 비밀번호 기본 검증
      const passwordResult = PasswordValidator.validate(credentials.password, 6);
      if (!passwordResult.isValid) {
        errors.push(...passwordResult.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 회원가입 폼 검증
   */
  validateRegisterForm(formData: RegisterFormData): ValidationResult {
    const errors: string[] = [];

    // 아이디 검증
    const idResult = IdValidator.validate(formData.id, 4);
    if (!idResult.isValid) {
      errors.push(...idResult.errors);
    }

    // 이름 검증
    const nameResult = NameValidator.validate(formData.name, 2);
    if (!nameResult.isValid) {
      errors.push(...nameResult.errors);
    }

    // 이메일 검증
    const emailResult = EmailValidator.validate(formData.email);
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors);
    }

    // 비밀번호 검증
    const passwordResult = PasswordValidator.validate(formData.password, 8);
    if (!passwordResult.isValid) {
      errors.push(...passwordResult.errors);
    }

    // 비밀번호 확인 검증
    const confirmResult = PasswordValidator.validateConfirmation(
      formData.password,
      formData.confirmPassword,
    );
    if (!confirmResult.isValid) {
      errors.push(...confirmResult.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 비밀번호 찾기 폼 검증
   */
  validateForgotPasswordForm(formData: ForgotPasswordFormData): ValidationResult {
    return EmailValidator.validate(formData.email);
  }

  /**
   * 필드별 검증 (실시간 검증용)
   */
  validateRegisterFormFields(formData: RegisterFormData): FieldValidationResult {
    return {
      id: IdValidator.validate(formData.id, 4),
      name: NameValidator.validate(formData.name, 2),
      email: EmailValidator.validate(formData.email),
      password: PasswordValidator.validate(formData.password, 8),
      confirmPassword: PasswordValidator.validateConfirmation(
        formData.password,
        formData.confirmPassword,
      ),
    };
  }

  /**
   * 비밀번호 강도 평가 (UI용)
   */
  evaluatePasswordStrength(password: string) {
    return PasswordValidator.validateStrength(password);
  }

  /**
   * 검증 에러 메시지 포맷팅
   */
  formatValidationErrors(errors: string[]): string {
    return errors.join(' ');
  }

  /**
   * 검증 결과를 예외로 변환
   */
  throwIfInvalid(result: ValidationResult): void {
    if (!result.isValid) {
      throw new Error(this.formatValidationErrors(result.errors));
    }
  }
}

// 싱글톤 인스턴스 export
export const validationService = new ValidationService();

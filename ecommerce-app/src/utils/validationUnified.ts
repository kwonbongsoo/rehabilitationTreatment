/**
 * 통합 검증 시스템
 * 
 * 모든 도메인의 검증 로직을 통합된 인터페이스로 제공합니다.
 * 사이드이펙트 없이 기존 API와 호환되는 새로운 검증 시스템입니다.
 */

// 공통 검증 유틸리티 re-export
export type {
  ValidationResult,
  FieldValidationResult,
  ValidationRule,
} from './validation';

export {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  PhoneValidator,
  ValidationUtils,
  validateRegisterForm,
  validateLoginForm,
  validateForgotPasswordForm,
} from './validation';

// Auth 도메인 검증 re-export
export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
} from '../domains/auth/services/ValidationService';

export {
  AuthValidationService,
  authValidationService,
} from '../domains/auth/services/ValidationService';

// Product 도메인 검증 re-export (새로운 통합 API)
export {
  validateFieldNew as validateProductField,
  validateFormNew as validateProductForm,
  // 레거시 호환성
  validateField as validateProductFieldLegacy,
  validateForm as validateProductFormLegacy,
} from '../domains/product/utils/productValidation';

// Cart 도메인 검증 re-export
export { CartValidationService } from '../domains/cart/services/CartValidationService';

// Import needed dependencies for the factory
import {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  PhoneValidator,
  ValidationUtils,
} from './validation';
import { authValidationService } from '../domains/auth/services/ValidationService';
import { CartValidationService } from '../domains/cart/services/CartValidationService';

/**
 * 통합 검증 팩토리
 * 
 * 모든 도메인의 검증을 통합된 방식으로 접근할 수 있게 해줍니다.
 */
export class UnifiedValidationService {
  // Auth 검증
  static get auth() {
    return {
      validateLogin: (data: { id: string; password: string }) => 
        authValidationService.validateLoginCredentials(data),
      validateRegister: (data: { id: string; password: string; confirmPassword: string; name: string; email: string }) => 
        authValidationService.validateRegisterForm(data),
      validateForgotPassword: (data: { email: string }) => 
        authValidationService.validateForgotPasswordForm(data),
    };
  }

  // Product 검증
  static get product() {
    return {
      validateField: async (name: string, value: string | boolean) => {
        const { validateFieldNew } = await import('../domains/product/utils/productValidation');
        return validateFieldNew(name, value);
      },
      validateForm: async (formData: any) => {
        const { validateFormNew } = await import('../domains/product/utils/productValidation');
        return validateFormNew(formData);
      },
    };
  }

  // Cart 검증
  static get cart() {
    return CartValidationService;
  }

  // 공통 유틸리티
  static get common() {
    return {
      email: EmailValidator,
      password: PasswordValidator,
      id: IdValidator,
      name: NameValidator,
      phone: PhoneValidator,
      utils: ValidationUtils,
    };
  }
}

/**
 * 기본 export - 편의성을 위한 단일 진입점
 */
export default UnifiedValidationService;

/**
 * 마이그레이션 가이드를 위한 타입 정의
 */
export interface MigrationGuide {
  /**
   * 기존 코드를 새로운 통합 시스템으로 마이그레이션하는 방법:
   * 
   * 1. Auth 검증:
   *    // 기존
   *    import { authValidationService } from '@/domains/auth/services/ValidationService';
   *    
   *    // 새로운 방식
   *    import UnifiedValidation from '@/utils/validationUnified';
   *    UnifiedValidation.auth.validateLogin(data);
   * 
   * 2. Product 검증:
   *    // 기존
   *    import { validateField } from '@/domains/product/utils/productValidation';
   *    
   *    // 새로운 방식
   *    import UnifiedValidation from '@/utils/validationUnified';
   *    await UnifiedValidation.product.validateField(name, value);
   * 
   * 3. Cart 검증:
   *    // 기존
   *    import { CartValidationService } from '@/domains/cart/services/CartValidationService';
   *    
   *    // 새로운 방식
   *    import UnifiedValidation from '@/utils/validationUnified';
   *    UnifiedValidation.cart.validateItem(item);
   */
}
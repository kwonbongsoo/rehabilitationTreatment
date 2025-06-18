/**
 * 유틸리티 통합 인덱스
 *
 * 카테고리별로 유틸리티를 정리하고 export 합니다.
 */

// 검증 관련 유틸리티
export {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  PhoneValidator,
  validateRegisterForm,
  validateLoginForm,
  validateForgotPasswordForm,
  type ValidationResult,
  type FieldValidationResult,
  type ValidationRule,
} from './validation';

// 에러 처리 유틸리티
export {
  ErrorHandler,
  ErrorClassifier,
  ErrorMessageExtractor,
  ErrorLogger,
  ErrorType,
  ERROR_MESSAGES,
  withErrorHandling,
  safeAsync,
  type StandardError,
} from './errorHandling';

// 알림 관리 유틸리티
export {
  NotificationManager,
  NotificationType,
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
  notify,
  type NotificationOptions,
} from './notifications';

// 포맷팅 유틸리티
export {
  formatPrice,
  calculateDiscountRate,
  calculateDiscountedPrice,
  formatCompactNumber,
  formatRatingStars,
  omitDeep,
  omitTokens,
  omitSensitiveData,
  SENSITIVE_KEYS,
} from './formatters';

// 카테고리별 유틸리티 그룹을 위한 import
import {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  PhoneValidator,
} from './validation';

import { ErrorHandler, ErrorClassifier, ErrorMessageExtractor, ErrorLogger } from './errorHandling';

import { NotificationManager, notify } from './notifications';

import {
  formatPrice,
  calculateDiscountRate,
  calculateDiscountedPrice,
  formatCompactNumber,
  formatRatingStars,
  omitDeep,
  omitTokens,
  omitSensitiveData,
} from './formatters';

// 카테고리별 유틸리티 그룹 export
export const ValidatorUtils = {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  PhoneValidator,
} as const;

export const ErrorUtils = {
  ErrorHandler,
  ErrorClassifier,
  ErrorMessageExtractor,
  ErrorLogger,
} as const;

export const NotificationUtils = {
  NotificationManager,
  notify,
} as const;

export const FormatUtils = {
  formatPrice,
  calculateDiscountRate,
  calculateDiscountedPrice,
  formatCompactNumber,
  formatRatingStars,
  omitDeep,
  omitTokens,
  omitSensitiveData,
} as const;

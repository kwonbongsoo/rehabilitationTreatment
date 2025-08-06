/**
 * Auth 도메인 공통 폼 훅
 *
 * LoginForm과 RegisterForm의 공통 패턴을 추상화하여
 * 중복을 제거하고 일관된 폼 동작을 제공합니다.
 */

import { useFormState, UseFormStateReturn } from '@/hooks/useFormState';
import { authValidationService } from '../services';
import {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
} from '../services/ValidationService';
import { ValidationError } from '@ecommerce/common';
import React from 'react';

/**
 * Auth 폼 타입 정의
 */
export type AuthFormType = 'login' | 'register' | 'forgotPassword';

/**
 * Auth 폼 데이터 유니온 타입
 */
export type AuthFormData = LoginFormData | RegisterFormData | ForgotPasswordFormData;

/**
 * Auth 폼 설정 인터페이스
 */
interface UseAuthFormOptions<T extends AuthFormData> {
  type: AuthFormType;
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
  preventDuplicateSubmit?: boolean;
  resetOnSuccess?: boolean;
}

/**
 * Auth 폼 훅 반환 타입
 */
export interface UseAuthFormReturn<T extends AuthFormData> extends UseFormStateReturn<T> {
  submitWithErrorHandling: (e: React.FormEvent) => Promise<void>;
}

/**
 * 폼 타입별 검증 함수 매핑
 */
const validationMap = {
  login: (data: LoginFormData) => authValidationService.validateLoginCredentials(data).errors,
  register: (data: RegisterFormData) => authValidationService.validateRegisterForm(data).errors,
  forgotPassword: (data: ForgotPasswordFormData) =>
    authValidationService.validateForgotPasswordForm(data).errors,
} as const;

/**
 * 타입 안전한 검증 함수 실행
 */
function getValidationErrors<T extends AuthFormData>(type: AuthFormType, data: T): string[] {
  switch (type) {
    case 'login':
      return validationMap.login(data as LoginFormData);
    case 'register':
      return validationMap.register(data as RegisterFormData);
    case 'forgotPassword':
      return validationMap.forgotPassword(data as ForgotPasswordFormData);
    default:
      return [];
  }
}

/**
 * Auth 공통 폼 훅
 */
export function useAuthForm<T extends AuthFormData>(
  options: UseAuthFormOptions<T>,
): UseAuthFormReturn<T> {
  const {
    type,
    initialData,
    onSubmit,
    preventDuplicateSubmit = true,
    resetOnSuccess = false,
  } = options;

  // 폼 상태 관리
  const form = useFormState<T>({
    initialData,
    validate: (data) => {
      return getValidationErrors(type, data);
    },
    preventDuplicateSubmit,
    resetOnSuccess,
  });

  // 에러 처리가 포함된 제출 핸들러
  const submitWithErrorHandling = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // ValidationError인 경우 필드별 에러 처리
      if (error instanceof ValidationError && error.details?.field) {
        throw error; // 폼 상태에서 처리하도록 다시 던짐
      }

      // 기타 에러는 일반 에러로 처리
      // onSubmit에서 이미 토스트 알림 등으로 처리되므로 여기서는 에러를 다시 던지지 않음
    }
  });

  return {
    ...form,
    submitWithErrorHandling,
  };
}

/**
 * 로그인 폼 전용 훅
 */
export function useLoginForm(
  onSubmit: (data: LoginFormData) => Promise<void>,
  options?: Partial<Omit<UseAuthFormOptions<LoginFormData>, 'type' | 'initialData' | 'onSubmit'>>,
) {
  return useAuthForm<LoginFormData>({
    type: 'login',
    initialData: { id: '', password: '' },
    onSubmit,
    ...options,
  });
}

/**
 * 회원가입 폼 전용 훅
 */
export function useRegisterForm(
  onSubmit: (data: RegisterFormData) => Promise<void>,
  options?: Partial<
    Omit<UseAuthFormOptions<RegisterFormData>, 'type' | 'initialData' | 'onSubmit'>
  >,
) {
  return useAuthForm<RegisterFormData>({
    type: 'register',
    initialData: {
      id: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
    },
    onSubmit,
    resetOnSuccess: true, // 회원가입 성공 시 폼 초기화
    ...options,
  });
}

/**
 * 비밀번호 찾기 폼 전용 훅
 */
export function useForgotPasswordForm(
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>,
  options?: Partial<
    Omit<UseAuthFormOptions<ForgotPasswordFormData>, 'type' | 'initialData' | 'onSubmit'>
  >,
) {
  return useAuthForm<ForgotPasswordFormData>({
    type: 'forgotPassword',
    initialData: { email: '' },
    onSubmit,
    ...options,
  });
}

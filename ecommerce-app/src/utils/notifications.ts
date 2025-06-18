/**
 * 알림 관리 유틸리티
 *
 * 프로젝트 전반에서 사용되는 알림 기능 중앙화
 * - 성공, 정보, 경고 메시지 관리
 * - Toast 설정 및 표시
 * - 중복 알림 방지
 */

import { toast } from 'react-toastify';

/**
 * 알림 타입 열거형
 */
export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * 알림 옵션 인터페이스
 */
export interface NotificationOptions {
  autoClose?: number;
  toastId?: string;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}

/**
 * 기본 알림 설정
 */
const DEFAULT_OPTIONS: Required<Omit<NotificationOptions, 'toastId'>> = {
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * 타입별 기본 설정
 */
const TYPE_SPECIFIC_OPTIONS: Record<NotificationType, Partial<NotificationOptions>> = {
  [NotificationType.SUCCESS]: { autoClose: 3000 },
  [NotificationType.INFO]: { autoClose: 4000 },
  [NotificationType.WARNING]: { autoClose: 4000 },
  [NotificationType.ERROR]: { autoClose: 5000 },
};

/**
 * Toast 유틸리티 클래스
 */
class ToastUtil {
  private static getOptions(type: NotificationType, options?: NotificationOptions) {
    return {
      ...DEFAULT_OPTIONS,
      ...TYPE_SPECIFIC_OPTIONS[type],
      ...options,
    };
  }

  static show(type: NotificationType, message: string, options?: NotificationOptions): void {
    const finalOptions = this.getOptions(type, options);

    switch (type) {
      case NotificationType.SUCCESS:
        toast.success(message, finalOptions);
        break;
      case NotificationType.INFO:
        toast.info(message, finalOptions);
        break;
      case NotificationType.WARNING:
        toast.warning(message, finalOptions);
        break;
      case NotificationType.ERROR:
        toast.error(message, finalOptions);
        break;
    }
  }
}

/**
 * 알림 관리자 클래스
 *
 * 애플리케이션의 모든 사용자 알림을 중앙에서 관리
 */
export class NotificationManager {
  /**
   * 성공 메시지 표시
   */
  static showSuccess(message: string, options?: NotificationOptions): void {
    ToastUtil.show(NotificationType.SUCCESS, message, options);
  }

  /**
   * 정보 메시지 표시
   */
  static showInfo(message: string, options?: NotificationOptions): void {
    ToastUtil.show(NotificationType.INFO, message, options);
  }

  /**
   * 경고 메시지 표시
   */
  static showWarning(message: string, options?: NotificationOptions): void {
    ToastUtil.show(NotificationType.WARNING, message, options);
  }

  /**
   * 에러 메시지 표시 (에러 핸들러에서 사용)
   */
  static showError(message: string, options?: NotificationOptions): void {
    ToastUtil.show(NotificationType.ERROR, message, options);
  }

  /**
   * 중복 방지 알림 (같은 ID의 토스트가 이미 있으면 표시하지 않음)
   */
  static showUniqueSuccess(message: string, toastId: string, options?: NotificationOptions): void {
    this.showSuccess(message, { ...options, toastId });
  }

  static showUniqueInfo(message: string, toastId: string, options?: NotificationOptions): void {
    this.showInfo(message, { ...options, toastId });
  }

  static showUniqueWarning(message: string, toastId: string, options?: NotificationOptions): void {
    this.showWarning(message, { ...options, toastId });
  }

  static showUniqueError(message: string, toastId: string, options?: NotificationOptions): void {
    this.showError(message, { ...options, toastId });
  }

  /**
   * 모든 토스트 제거
   */
  static dismissAll(): void {
    toast.dismiss();
  }

  /**
   * 특정 토스트 제거
   */
  static dismiss(toastId: string): void {
    toast.dismiss(toastId);
  }
}

/**
 * 미리 정의된 성공 메시지들
 */
export const SUCCESS_MESSAGES = {
  // 회원 관련
  REGISTRATION_SUCCESS: '회원가입이 완료되었습니다.',
  LOGIN_SUCCESS: '로그인되었습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  PASSWORD_CHANGE_SUCCESS: '비밀번호가 변경되었습니다.',

  // 데이터 관련
  SAVE_SUCCESS: '저장되었습니다.',
  UPDATE_SUCCESS: '수정되었습니다.',
  DELETE_SUCCESS: '삭제되었습니다.',

  // 일반적인 작업
  OPERATION_SUCCESS: '작업이 완료되었습니다.',
  COPY_SUCCESS: '클립보드에 복사되었습니다.',
  SEND_SUCCESS: '전송되었습니다.',
} as const;

/**
 * 미리 정의된 정보 메시지들
 */
export const INFO_MESSAGES = {
  LOADING: '처리 중입니다...',
  REDIRECT: '페이지를 이동합니다.',
  AUTO_SAVE: '자동으로 저장됩니다.',
} as const;

/**
 * 간편 함수들 (선택적 사용)
 */
export const notify = {
  success: (message: string, options?: NotificationOptions) =>
    NotificationManager.showSuccess(message, options),

  info: (message: string, options?: NotificationOptions) =>
    NotificationManager.showInfo(message, options),

  warning: (message: string, options?: NotificationOptions) =>
    NotificationManager.showWarning(message, options),

  error: (message: string, options?: NotificationOptions) =>
    NotificationManager.showError(message, options),
};

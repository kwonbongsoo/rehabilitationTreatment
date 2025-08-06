/**
 * 회원가입 관련 상수 정의
 * 매직 넘버와 문자열을 중앙 집중 관리
 */

export const REGISTER_CONSTANTS = {
  // 타이밍 관련
  REDIRECT_DELAY_MS: 1500,
  
  // 검증 최소 길이
  MIN_ID_LENGTH: 4,
  MIN_NAME_LENGTH: 2,
  MIN_PASSWORD_LENGTH: 8,
  MIN_LOGIN_ID_LENGTH: 3,
  MIN_LOGIN_PASSWORD_LENGTH: 8, // 로그인 시에도 최소 8자 요구 (7자 이하 차단)
  
  // UI 텍스트
  FORM_LABELS: {
    USERNAME: 'Username',
    NAME: 'Name',
    EMAIL: 'Email',
    PASSWORD: 'Password',
    CONFIRM_PASSWORD: 'Confirm Password',
    AGREE_TERMS: 'Agree with Terms & Condition',
  },
  
  // 버튼 텍스트
  BUTTON_TEXT: {
    SIGN_UP: 'Sign up',
    CREATING: 'Creating...',
  },
  
  // 에러 메시지 키워드 (에러 식별용)
  ERROR_KEYWORDS: {
    ID: '아이디',
    NAME: '이름',
    EMAIL: '이메일',
    PASSWORD: '비밀번호',
    CONFIRM: '확인',
  },
  
  // 성공 메시지
  SUCCESS_MESSAGE: '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.',
  
  // 페이지 경로
  ROUTES: {
    LOGIN: '/auth/login',
    LOGIN_WITH_SUCCESS: '/auth/login?message=registration_success',
    HOME: '/',
  },
} as const;

// 타입 추출
export type RegisterConstants = typeof REGISTER_CONSTANTS;
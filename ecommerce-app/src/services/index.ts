/**
 * 서비스 레이어 통합 인덱스
 *
 * 클린 아키텍처에 따라 계층별로 서비스를 정리하고 export 합니다.
 */

// Domain Layer (비즈니스 로직)
export { AuthDomainService, authDomainService } from './domain/authDomainService';
export { MemberDomainService, memberDomainService } from './domain/memberDomainService';

// Application Layer (애플리케이션 로직)
export {
  ValidationService,
  validationService,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
} from './application/validationService';

// Infrastructure Layer (인프라 서비스)
export {
  CookieService,
  cookieService,
  createTokenCookies,
  setAuthCookies,
  setLoginCookies,
  clearAuthCookies,
  setTokenCookiesEdge,
  type TokenResult,
} from './infrastructure/cookieService';

export {
  TokenService,
  tokenService,
  issueGuestTokenWithCookieSSR,
  type TokenWithCookieResult,
} from './infrastructure/tokenService';

// UI Layer (UI 설정 서비스)
export {
  UIConfigurationService,
  createUIConfigurationService,
  type UIConfiguration,
  type QueryClientConfig,
  type ToastConfig,
  type DevtoolsConfig,
} from './uiConfigurationService';

// 계층별 서비스 그룹 생성 (import 후)
import { authDomainService } from './domain/authDomainService';
import { memberDomainService } from './domain/memberDomainService';
import { validationService } from './application/validationService';
import { cookieService } from './infrastructure/cookieService';
import { tokenService } from './infrastructure/tokenService';

export const DomainServices = {
  auth: authDomainService,
  member: memberDomainService,
} as const;

export const ApplicationServices = {
  validation: validationService,
} as const;

export const InfrastructureServices = {
  cookie: cookieService,
  token: tokenService,
} as const;

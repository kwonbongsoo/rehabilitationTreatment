import { LoginRequest, UserResponse } from '@/api/models/auth';

/**
 * 인증 도메인 서비스
 * 인증 관련 비즈니스 규칙과 도메인 로직을 캡슐화
 */
export class AuthDomainService {
  /**
   * 사용자가 인증되었는지 확인
   */
  isAuthenticated(user: UserResponse | null, token: string | null): boolean {
    return Boolean(token && user && user.role !== 'guest');
  }

  /**
   * 사용자가 게스트인지 확인
   */
  isGuest(user: UserResponse | null): boolean {
    return user?.role === 'guest';
  }

  /**
   * 리다이렉트 URL 생성
   */
  getRedirectUrl(query: Record<string, string | string[] | undefined>, defaultPath = '/'): string {
    const redirectTo = query.redirect as string;

    // 안전한 리다이렉트 URL 확인
    if (redirectTo && this.isSafeRedirectUrl(redirectTo)) {
      return redirectTo;
    }

    return defaultPath;
  }

  /**
   * 안전한 리다이렉트 URL인지 확인 (오픈 리다이렉트 방지)
   */
  private isSafeRedirectUrl(url: string): boolean {
    // 상대 경로만 허용
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    // 절대 경로는 허용하지 않음
    return false;
  }

  /**
   * 사용자 권한 확인
   */
  hasPermission(user: UserResponse | null, requiredRole: string): boolean {
    if (!user || !user.role) return false;

    // 간단한 역할 기반 권한 확인 (추후 더 복잡한 권한 시스템으로 확장 가능)
    const roleHierarchy = ['guest', 'user', 'admin'];
    const userRoleLevel = roleHierarchy.indexOf(user.role);
    const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);

    return userRoleLevel >= requiredRoleLevel;
  }
}

// 싱글톤 인스턴스 export
export const authDomainService = new AuthDomainService();

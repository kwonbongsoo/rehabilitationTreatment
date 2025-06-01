import { LoginRequest, LoginResponse, UserResponse } from '@/api/models/auth';

/**
 * 인증 도메인 서비스
 * 비즈니스 규칙과 도메인 로직을 캡슐화
 */
export class AuthDomainService {
    /**
     * 로그인 자격 증명 검증
     */
    validateLoginCredentials(credentials: LoginRequest): void {
        const errors: string[] = [];

        // 필수 필드 검증
        if (!credentials.id?.trim()) {
            errors.push('아이디를 입력해주세요.');
        }

        if (!credentials.password?.trim()) {
            errors.push('비밀번호를 입력해주세요.');
        }

        // 아이디 규칙 검증
        if (credentials.id && credentials.id.trim().length < 3) {
            errors.push('아이디는 최소 3자 이상이어야 합니다.');
        }

        // 아이디 형식 검증 (영문, 숫자, 특수문자만 허용)
        if (credentials.id && !/^[a-zA-Z0-9_-]+$/.test(credentials.id.trim())) {
            errors.push('아이디는 영문, 숫자, _, - 만 사용할 수 있습니다.');
        }

        // 비밀번호 규칙 검증
        if (credentials.password && credentials.password.length < 6) {
            errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
    }

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
    getRedirectUrl(
        query: Record<string, string | string[] | undefined>,
        defaultPath = '/'
    ): string {
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
}

// 싱글톤 인스턴스 export
export const authDomainService = new AuthDomainService();

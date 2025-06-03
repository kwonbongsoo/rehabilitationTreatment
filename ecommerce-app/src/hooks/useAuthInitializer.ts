import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/store/authStore';
import { cookieService } from '@/services/cookieService';
import { useSessionInfo } from '@/hooks/queries/useAuth';

/**
 * 전역 인증 초기화 훅
 * 
 * 책임:
 * 1. 앱 시작 시 토큰 검증
 * 2. session-info API 호출하여 사용자/게스트 정보 로드
 * 3. AuthStore 상태 업데이트
 * 4. 중복 실행 방지
 */
export const useAuthInitializer = () => {
    const { setUser, isLoading } = useAuth();
    const sessionInfoMutation = useSessionInfo();
    const isInitialized = useRef(false);

    /**
     * 인증 초기화 로직
     */
    const initializeAuth = useCallback(async () => {
        // 이미 초기화되었거나 로딩 중이면 실행하지 않음
        if (isInitialized.current || isLoading) {
            return;
        }

        isInitialized.current = true;

        try {
            // 클라이언트에서만 실행
            if (typeof window === 'undefined') {
                return;
            }

            await sessionInfoMutation.mutateAsync();

        } catch (error) {
            console.error('Auth initialization failed:', error);
            // 초기화 실패 시 상태 리셋
            await cookieService.clearToken();
            setUser(null);
        }
    }, [isLoading, sessionInfoMutation, setUser]);

    // 컴포넌트 마운트 시 한 번만 실행
    useEffect(() => {
        initializeAuth();
    }, []); // 의존성 배열을 비워서 한 번만 실행

    // 페이지 포커스 시 토큰 재검증 (선택적)
    useEffect(() => {
        const handleFocus = () => {
            const token = cookieService.getToken();
            if (token) {
                // 현재 토큰과 다르면 재초기화
                initializeAuth();
            }
        };

        // 페이지 포커스 이벤트 리스너 등록
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [initializeAuth]);

    return {
        initializeAuth,
        isInitialized: isInitialized.current,
        isLoading: sessionInfoMutation.isPending
    };
};

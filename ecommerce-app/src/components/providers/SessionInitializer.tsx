'use client';

import { useAuth } from '@/domains/auth/stores';
import { useCurrentUser } from '@/domains/auth/hooks';
import { useEffect, ReactElement } from 'react';

/**
 * 세션 초기화 전용 컴포넌트
 *
 * 특징:
 * - 앱 시작 시 한 번만 세션 정보 초기화
 * - useCurrentUser를 통해 사용자 정보 가져오기
 * - zustand store에 세션 정보 설정
 * - UI 렌더링 없음 (순수 로직 컴포넌트)
 */
export default function SessionInitializer(): ReactElement | null {
  const { setUser, isSessionInitialized } = useAuth();
  const { data: user, isLoading, error } = useCurrentUser();

  // 세션 초기화 로직
  useEffect(() => {
    // 이미 초기화되었으면 건너뛰기
    if (isSessionInitialized) {
      return;
    }

    // 로딩 중이면 대기
    if (isLoading) {
      return;
    }

    // API 호출 완료 시 (성공/실패 무관하게) 세션 초기화 처리
    try {
      setUser(user || null);
    } catch (err) {
      console.error('Session initialization error:', err);
      setUser(null); // 에러 시 게스트로 처리
    }
  }, [user, isLoading, error, isSessionInitialized, setUser]);

  // UI 렌더링 없음
  return null;
}

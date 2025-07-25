'use server';

import { cookies } from 'next/headers';
import { SessionInfoResponse, UserResponse } from '@/domains/auth/types/auth';
import { AUTH_SERVICE_URL } from '@/api/config';

/**
 * 서버에서 세션 정보 조회 (내부용)
 */
async function getSessionInfo(): Promise<SessionInfoResponse | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null; // 인증되지 않은 상태
    }

    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/session-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store', // 항상 최신 세션 정보 가져오기
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // 토큰이 유효하지 않음
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching session info:', error);
    return null;
  }
}

/**
 * 서버에서 인증 상태 확인
 * - 더 간단한 boolean 반환
 */
export async function isAuthenticated(): Promise<boolean> {
  const sessionInfo = await getSessionInfo();
  return sessionInfo !== null;
}

/**
 * 현재 사용자 정보 조회 Server Action
 * - React Query에서 호출 가능
 * - 서버에서 실행되어 쿠키 접근 가능
 */
export async function getCurrentUser(): Promise<UserResponse | null> {
  const sessionInfo = await getSessionInfo();
  return sessionInfo?.data || null;
}
'use server';

import { SessionInfoResponse, SessionInfoActionResult } from '@/domains/auth/types/auth';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import { handleApiResponse, handleActionError } from '@/lib/server/errorHandler';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * 서버에서 세션 정보 조회 Server Action
 * - React Query에서 호출 가능
 * - 서버에서 실행되어 쿠키 접근 가능
 * - 상태 코드를 포함하여 반환
 */
export async function getSessionInfo(): Promise<SessionInfoActionResult> {
  try {
    const headers = await HeaderBuilderFactory.createForApiRequest().build();

    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/session-info`, {
      method: 'GET',
      headers,
      cache: 'no-store', // 항상 최신 세션 정보 가져오기
    });

    const result = await handleApiResponse(response, (json: SessionInfoResponse) => json.data);
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * 현재 사용자 정보 조회 Server Action
 * - React Query에서 호출 가능
 * - 서버에서 실행되어 쿠키 접근 가능
 */
export async function getCurrentUser(): Promise<SessionInfoActionResult> {
  const sessionResult = await getSessionInfo();

  if (!sessionResult.success) {
    return {
      success: false,
      error: sessionResult.error || '사용자 정보 조회에 실패했습니다.',
      statusCode: sessionResult.statusCode || 500,
    };
  }

  if (!sessionResult.data) {
    return {
      success: false,
      error: '사용자 세션 정보를 찾을 수 없습니다.',
      statusCode: 404,
    };
  }

  return {
    success: true,
    data: sessionResult.data,
  };
}

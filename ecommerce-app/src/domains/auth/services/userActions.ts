'use server';

import {
  ProxySessionInfoResponse,
  SessionInfoActionResult,
  SessionInfoResponseI,
} from '@/domains/auth/types/auth';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import { handleApiServerActionResponse, handleActionError } from '@/lib/server/errorHandler';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * 서버에서 세션 정보 조회 Server Action
 * - 서버에서 실행되어 쿠키 접근 가능
 */
export async function getSessionInfo(): Promise<SessionInfoActionResult> {
  try {
    const headers = await HeaderBuilderFactory.createForApiRequest().build();

    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/session-info`, {
      method: 'GET',
      headers,
      cache: 'no-store', // 항상 최신 세션 정보 가져오기
    });

    const result = (await handleApiServerActionResponse(response)) as ProxySessionInfoResponse;
    const { access_token: _access_token, ...data } = result.data;
    void _access_token;
    return {
      success: true,
      data,
    };
  } catch (error) {
    return handleActionError(error) as SessionInfoActionResult;
  }
}

/**
 * 현재 사용자 정보 조회 Server Action
 * - 서버에서 실행되어 쿠키 접근 가능
 */
export async function getCurrentUser(): Promise<SessionInfoActionResult> {
  const { success, error, statusCode, data } = await getSessionInfo();

  if (!success) {
    return {
      success: false,
      error: error ?? '사용자 정보 조회에 실패했습니다.',
      statusCode: statusCode ?? 500,
    };
  }

  return {
    success,
    data: data as SessionInfoResponseI,
  };
}

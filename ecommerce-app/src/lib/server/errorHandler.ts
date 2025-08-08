/**
 * 서버 액션 공통 에러 처리 유틸리티
 */

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * API 응답을 처리하고 적절한 ActionResult를 반환
 */
export async function handleApiServerActionResponse<T>(
  response: Response,
): Promise<ActionResult<T>> {
  try {
    if (response.ok) {
      const { data } = await response.json();

      // successDataExtractor 실행 중 에러가 발생하면 캐치
      try {
        return {
          success: true,
          data,
        };
      } catch (extractorError) {
        return {
          success: false,
          error:
            extractorError instanceof Error
              ? extractorError.message
              : '데이터 처리 중 오류가 발생했습니다.',
          statusCode: 500,
        };
      }
    }

    // 에러 응답에서 메시지 추출
    let errorMessage = '오류가 발생했습니다.';

    try {
      const errorJson = await response.json();
      if (errorJson?.message) {
        errorMessage = errorJson.message;
      } else if (errorJson?.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    return {
      success: false,
      error: errorMessage,
      statusCode: response.status,
    };
  } catch {
    return {
      success: false,
      error: 'API 응답 처리 중 오류가 발생했습니다.',
      statusCode: 500,
    };
  }
}

/**
 * 네트워크 에러 등 예외 상황을 처리하고 ActionResult를 반환
 */
export function handleActionError(error: unknown): ActionResult {
  let errorMessage = '서버 오류가 발생했습니다.';

  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      errorMessage = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    } else if (error.message.includes('timeout')) {
      errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
  }

  return {
    success: false,
    error: errorMessage,
    statusCode: 500,
  };
}

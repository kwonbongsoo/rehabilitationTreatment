/**
 * API 요청 공통 훅들
 *
 * 프로젝트 전반에서 사용되는 API 요청 패턴들을 표준화
 * - 로딩, 에러, 성공 상태 관리
 * - 재시도 로직
 * - 캐싱 지원
 * - 취소 가능한 요청
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * API 요청 상태 인터페이스
 */
export interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  cacheKey?: string;
  cacheDuration?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * 기본 API 요청 훅
 */
export function useApiRequest<T>(requestFn: () => Promise<T>, options: ApiRequestOptions = {}) {
  const {
    immediate = false,
    retries = 0,
    retryDelay = 1000,
    timeout = 30000,
    cacheKey,
    cacheDuration = 300000, // 5분
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const { handleApiError } = useErrorHandler();
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 캐시 관리
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const getCachedData = useCallback(
    (key: string): T | null => {
      if (!cacheKey) return null;

      const cached = cache.current.get(key);
      if (!cached) return null;

      const isExpired = Date.now() - cached.timestamp > cacheDuration;
      if (isExpired) {
        cache.current.delete(key);
        return null;
      }

      return cached.data;
    },
    [cacheKey, cacheDuration],
  );

  const setCachedData = useCallback(
    (key: string, data: T) => {
      if (!cacheKey) return;
      cache.current.set(key, { data, timestamp: Date.now() });
    },
    [cacheKey],
  );

  const execute = useCallback(async (): Promise<T | null> => {
    // 캐시된 데이터 확인
    if (cacheKey) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setState((prev) => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          success: true,
        }));
        return cachedData;
      }
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    const attemptRequest = async (attempt: number): Promise<T> => {
      try {
        // 타임아웃 설정
        if (timeout > 0) {
          timeoutRef.current = setTimeout(() => {
            abortControllerRef.current?.abort();
          }, timeout);
        }

        const result = await requestFn();

        // 타임아웃 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        return result;
      } catch (error: any) {
        // 타임아웃 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 취소된 요청은 무시
        if (error.name === 'AbortError') {
          throw error;
        }

        // 재시도 로직
        // if (attempt < retries) {
        //   await new Promise((resolve) => setTimeout(resolve, retryDelay));
        //   return attemptRequest(attempt + 1);
        // }

        throw error;
      }
    };

    try {
      retryCountRef.current = 0;
      const result = await attemptRequest(0);

      // 요청이 취소되지 않았다면 상태 업데이트
      if (!abortControllerRef.current?.signal.aborted) {
        setState((prev) => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          success: true,
        }));

        // 캐시에 저장
        if (cacheKey) {
          setCachedData(cacheKey, result);
        }

        onSuccess?.(result);
        return result;
      }
    } catch (error: any) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = error.message || 'API 요청 중 오류가 발생했습니다.';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));

        handleApiError(error);
        onError?.(error);
      }
    }

    return null;
  }, [
    requestFn,
    retries,
    retryDelay,
    timeout,
    cacheKey,
    getCachedData,
    setCachedData,
    handleApiError,
    onSuccess,
    onError,
  ]);

  // 요청 취소
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState((prev) => ({
      ...prev,
      loading: false,
    }));
  }, []);

  // 상태 리셋
  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    retryCountRef.current = 0;
  }, [cancel]);

  // 즉시 실행
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    ...state,
    execute,
    cancel,
    reset,
    retry: execute,
    retryCount: retryCountRef.current,
  };
}

/**
 * 뮤테이션 훅 (POST, PUT, DELETE 등)
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: ApiRequestOptions = {},
) {
  const [state, setState] = useState<ApiRequestState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const { handleApiError } = useErrorHandler();
  const { onSuccess, onError } = options;

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      try {
        const result = await mutationFn(variables);

        setState((prev) => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          success: true,
        }));

        onSuccess?.(result);
        return result;
      } catch (error: any) {
        const errorMessage = error.message || '요청 처리 중 오류가 발생했습니다.';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));

        handleApiError(error);
        onError?.(error);
        return null;
      }
    },
    [mutationFn, handleApiError, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * 페이지네이션 훅
 */
export interface PaginationOptions<T> {
  pageSize?: number;
  initialPage?: number;
  fetchFn: (
    page: number,
    pageSize: number,
  ) => Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
  }>;
}

export function usePagination<T>(options: PaginationOptions<T>) {
  const { pageSize = 10, initialPage = 1, fetchFn } = options;

  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const requestFn = useCallback(() => fetchFn(page, pageSize), [fetchFn, page, pageSize]);

  const { data, loading, error, execute } = useApiRequest(requestFn, {
    onSuccess: (result) => {
      if (page === 1) {
        setAllData(result.data);
      } else {
        setAllData((prev) => [...prev, ...result.data]);
      }
      setTotal(result.total);
      setHasMore(result.hasMore);
    },
  });

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    execute();
  }, [execute]);

  useEffect(() => {
    execute();
  }, [page, execute]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    total,
    page,
    loadMore,
    refresh,
    setPage,
  };
}

/**
 * 무한 스크롤 훅
 */
export function useInfiniteScroll<T>(
  fetchFn: (cursor: string | null) => Promise<{
    data: T[];
    nextCursor: string | null;
  }>,
  options: { threshold?: number } = {},
) {
  const { threshold = 100 } = options;

  const [allData, setAllData] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const requestFn = useCallback(() => fetchFn(nextCursor), [fetchFn, nextCursor]);

  const { loading, error, execute } = useApiRequest(requestFn, {
    onSuccess: (result) => {
      setAllData((prev) => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    },
  });

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      execute();
    }
  }, [loading, hasMore, execute]);

  const refresh = useCallback(() => {
    setAllData([]);
    setNextCursor(null);
    setHasMore(true);
    execute();
  }, [execute]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - threshold
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, threshold]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

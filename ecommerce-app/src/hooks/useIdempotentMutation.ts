import React, { useCallback, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 도메인 타입 정의
export interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  useSessionKey?: boolean;
}

export interface RequestStatus {
  idempotencyKey: string;
  sessionKey: string;
  isInProgress: boolean;
}

export interface MutationFunction<TData, TVariables> {
  (variables: TVariables, idempotencyKey: string): Promise<TData>;
}

// 에러 메시지 상수
const IDEMPOTENT_ERRORS = {
  ALREADY_SUBMITTING: '요청이 이미 처리 중입니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN_ERROR: 'Unknown error occurred',
} as const;

// 키 생성 전략 인터페이스
interface IKeyGenerator {
  generateSessionKey(): string;
  generateRequestKey(): string;
}

// 상태 관리 인터페이스
interface ISubmissionState {
  isSubmitting: boolean;
  currentRequestId: string | null;
  setSubmitting(value: boolean): void;
  setCurrentRequestId(id: string | null): void;
}

// 키 생성기 클래스 (단일 책임 원칙)
class IdempotencyKeyGenerator implements IKeyGenerator {
  private static readonly KEY_PREFIX = {
    SESSION: 'session',
    REQUEST: 'request',
  } as const;

  generateSessionKey(): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    return `${IdempotencyKeyGenerator.KEY_PREFIX.SESSION}-${timestamp}-${uuid}`;
  }

  generateRequestKey(): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    return `${IdempotencyKeyGenerator.KEY_PREFIX.REQUEST}-${timestamp}-${uuid}`;
  }
}

// 제출 상태 관리 클래스 (단일 책임 원칙)
class SubmissionStateManager implements ISubmissionState {
  constructor(
    private setIsSubmitting: (value: boolean) => void,
    private requestIdRef: React.MutableRefObject<string | null>,
    public isSubmitting: boolean,
  ) {}

  get currentRequestId(): string | null {
    return this.requestIdRef.current;
  }

  setSubmitting(value: boolean): void {
    this.setIsSubmitting(value);
  }

  setCurrentRequestId(id: string | null): void {
    this.requestIdRef.current = id;
  }
}

// 에러 처리 유틸리티 클래스 (단일 책임 원칙)
class ErrorHandler {
  static normalizeError(error: unknown): Error {
    return error instanceof Error ? error : new Error(IDEMPOTENT_ERRORS.UNKNOWN_ERROR);
  }

  static validateNotSubmitting(isSubmitting: boolean): void {
    if (isSubmitting) {
      throw new Error(IDEMPOTENT_ERRORS.ALREADY_SUBMITTING);
    }
  }
}

// 뮤테이션 실행기 클래스 (조합 패턴)
class MutationExecutor<TData, TVariables> {
  constructor(
    private keyGenerator: IKeyGenerator,
    private stateManager: ISubmissionState,
    private sessionKey: string,
  ) {}

  async execute(
    mutationFn: MutationFunction<TData, TVariables>,
    variables: TVariables,
    options?: MutationOptions<TData>,
  ): Promise<TData> {
    // 중복 요청 검증
    ErrorHandler.validateNotSubmitting(this.stateManager.isSubmitting);

    // 멱등성 키 결정
    const idempotencyKey = this.determineIdempotencyKey(options);

    // 실행 상태 설정
    this.stateManager.setCurrentRequestId(idempotencyKey);
    this.stateManager.setSubmitting(true);

    try {
      const result = await mutationFn(variables, idempotencyKey);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const normalizedError = ErrorHandler.normalizeError(error);
      options?.onError?.(normalizedError);
      throw normalizedError;
    } finally {
      this.stateManager.setSubmitting(false);
    }
  }

  private determineIdempotencyKey(options?: MutationOptions<TData>): string {
    return options?.useSessionKey !== false
      ? this.sessionKey
      : this.keyGenerator.generateRequestKey();
  }
}

/**
 * 멱등성을 보장하는 뮤테이션 훅
 *
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: 각 클래스가 하나의 책임만 담당
 * - 의존성 역전 원칙: 인터페이스 기반 설계
 * - 조합 패턴: 여러 서비스를 조합하여 복잡한 로직 구성
 */
export function useIdempotentMutation<TData, TVariables>(): {
  executeMutation: (
    mutationFn: MutationFunction<TData, TVariables>,
    variables: TVariables,
    options?: MutationOptions<TData>,
  ) => Promise<TData>;
  cancelCurrentRequest: () => void;
  getRequestStatus: () => RequestStatus;
  generateIdempotencyKey: () => string;
} {
  const keyGenerator = useMemo(() => new IdempotencyKeyGenerator(), []);

  // 세션별 고정 멱등성 키 (컴포넌트 마운트 시 한 번만 생성)
  const [sessionIdempotencyKey] = useState(() => keyGenerator.generateSessionKey());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestIdRef = useRef<string | null>(null);

  // 상태 관리자 생성 - useMemo로 메모이제이션
  const stateManager = useMemo(
    () => new SubmissionStateManager(setIsSubmitting, requestIdRef, isSubmitting),
    [isSubmitting],
  );

  // 뮤테이션 실행기 생성 - useMemo로 메모이제이션
  const mutationExecutor = useMemo(
    () =>
      new MutationExecutor<TData, TVariables>(keyGenerator, stateManager, sessionIdempotencyKey),
    [keyGenerator, stateManager, sessionIdempotencyKey],
  );

  /**
   * 멱등성이 보장되는 뮤테이션 실행
   */
  const executeMutation = useCallback(
    (
      mutationFn: MutationFunction<TData, TVariables>,
      variables: TVariables,
      options?: MutationOptions<TData>,
    ): Promise<TData> => {
      return mutationExecutor.execute(mutationFn, variables, options);
    },
    [mutationExecutor],
  );

  /**
   * 현재 진행 중인 요청 취소
   */
  const cancelCurrentRequest = useCallback(() => {
    stateManager.setCurrentRequestId(null);
    stateManager.setSubmitting(false);
  }, [stateManager]);

  /**
   * 현재 요청 상태 조회
   */
  const getRequestStatus = useCallback(
    (): RequestStatus => ({
      idempotencyKey: stateManager.currentRequestId || sessionIdempotencyKey,
      sessionKey: sessionIdempotencyKey,
      isInProgress: stateManager.isSubmitting,
    }),
    [stateManager, sessionIdempotencyKey],
  );

  /**
   * 새로운 멱등성 키 생성
   */
  const generateIdempotencyKey = useCallback(() => {
    return keyGenerator.generateRequestKey();
  }, [keyGenerator]);

  return {
    executeMutation,
    cancelCurrentRequest,
    getRequestStatus,
    generateIdempotencyKey,
  };
}

import { useRef, useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * 멱등성을 보장하는 뮤테이션 훅
 * 중복 요청을 방지하고 고유한 idempotency key를 생성
 * 컴포넌트 마운트 시 한 번만 키를 생성하여 세션별 멱등성 보장
 */
export function useIdempotentMutation<TData, TVariables>() {
    // 컴포넌트 마운트 시 한 번만 생성되는 고정 멱등성 키
    const [sessionIdempotencyKey] = useState(() => {
        const timestamp = Date.now();
        const uuid = uuidv4();
        return `session-${timestamp}-${uuid}`;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const requestIdRef = useRef<string | null>(null);

    /**
     * 새로운 멱등성 키 생성 (필요시에만 사용)
     */
    const generateIdempotencyKey = useCallback(() => {
        const timestamp = Date.now();
        const uuid = uuidv4();
        return `${timestamp}-${uuid}`;
    }, []);    /**
     * 멱등성이 보장되는 뮤테이션 래퍼
     */
    const executeMutation = useCallback(
        async (
            mutationFn: (variables: TVariables, idempotencyKey: string) => Promise<TData>,
            variables: TVariables,
            options?: {
                onSuccess?: (data: TData) => void;
                onError?: (error: Error) => void;
                useSessionKey?: boolean; // 세션 키 사용 여부 (기본값: true)
            }
        ): Promise<TData> => {
            // 이미 제출 중인 경우 중복 요청 차단
            if (isSubmitting) {
                throw new Error('요청이 이미 처리 중입니다. 잠시 후 다시 시도해주세요.');
            }

            // 멱등성 키 결정: 세션 키 또는 새로운 키
            const idempotencyKey = options?.useSessionKey !== false
                ? sessionIdempotencyKey
                : generateIdempotencyKey();

            requestIdRef.current = idempotencyKey;
            setIsSubmitting(true);

            try {
                const result = await mutationFn(variables, idempotencyKey);

                options?.onSuccess?.(result);
                return result;
            } catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
                options?.onError?.(errorObj);
                throw errorObj;
            } finally {
                setIsSubmitting(false);
            }
        },
        [generateIdempotencyKey, sessionIdempotencyKey, isSubmitting]
    );

    /**
     * 현재 진행 중인 요청 취소 (상태 초기화)
     */
    const cancelCurrentRequest = useCallback(() => {
        requestIdRef.current = null;
        setIsSubmitting(false);
    }, []);

    /**
     * 현재 상태 조회
     */
    const getRequestStatus = useCallback(() => ({
        idempotencyKey: requestIdRef.current || sessionIdempotencyKey,
        sessionKey: sessionIdempotencyKey,
        isInProgress: isSubmitting
    }), [sessionIdempotencyKey, isSubmitting]);

    return {
        executeMutation,
        cancelCurrentRequest,
        getRequestStatus,
        generateIdempotencyKey
    };
}

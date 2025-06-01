import { FastifyRequest, FastifyReply } from 'fastify';
import { RedisClient } from '../utils/redisClient';

interface IdempotencyOptions {
    redis: RedisClient;
    ttl?: number; // TTL in seconds, default 60 (1 minute)
    keyPrefix?: string;
}

interface CachedResponse {
    statusCode: number;
    body: any;
    headers: Record<string, string>;
    timestamp: number;
}

/**
 * Fastify 멱등성 미들웨어
 * POST/PUT/PATCH 요청에 대해 X-Idempotency-Key 헤더 기반 멱등성 보장
 */
export class IdempotencyMiddleware {
    private redis: RedisClient;
    private ttl: number;
    private keyPrefix: string;

    constructor(options: IdempotencyOptions) {
        this.redis = options.redis;
        this.ttl = options.ttl || 60; // 1분
        this.keyPrefix = options.keyPrefix || 'member-idempotency:';
    }

    /**
     * 멱등성이 필요한 메서드인지 확인
     */
    private needsIdempotency(method: string): boolean {
        return ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
    }

    /**
     * 멱등성이 필요한 경로인지 확인
     */
    private needsIdempotencyForPath(path: string): boolean {
        const criticalPaths = [
            '/api/members',        // 회원 생성
            '/api/members/',       // 회원 관련 작업
        ];

        return criticalPaths.some(criticalPath =>
            path === criticalPath || path.startsWith(criticalPath)
        );
    }

    /**
     * 대소문자 구분 없이 헤더에서 멱등성 키 찾기
     */
    private getIdempotencyKey(headers: Record<string, any>): string | undefined {
        // 가능한 모든 케이스 시도
        const possibleKeys = [
            'x-idempotency-key',
            'X-Idempotency-Key',
            'X-IDEMPOTENCY-KEY',
            'x-Idempotency-key'
        ];

        for (const key of possibleKeys) {
            if (headers[key]) {
                return headers[key] as string;
            }
        }

        // 직접 검색 (헤더 키들을 순회하며 찾기)
        for (const [headerName, headerValue] of Object.entries(headers)) {
            if (headerName.toLowerCase() === 'x-idempotency-key') {
                return headerValue as string;
            }
        } return undefined;
    }

    /**
     * 요청 전처리 - 중복 요청 체크
     * onRequest 단계에서 실행되어 스키마 검증보다 먼저 처리
     */
    async onRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const method = request.method;
        const path = request.url;

        // 멱등성이 필요하지 않은 요청은 통과
        if (!this.needsIdempotency(method) || !this.needsIdempotencyForPath(path)) {
            return;
        }

        // 헤더에서 멱등성 키 안전하게 찾기
        const idempotencyKey = this.getIdempotencyKey(request.headers);

        if (!idempotencyKey) {
            reply.code(400).send({
                success: false,
                error: 'X-Idempotency-Key header is required for this operation',
                code: 'MISSING_IDEMPOTENCY_KEY'
            }); return;
        }

        // 멱등성 키 형식 검증
        if (!this.isValidIdempotencyKey(idempotencyKey)) {
            reply.code(400).send({
                success: false,
                error: 'Invalid X-Idempotency-Key format',
                code: 'INVALID_IDEMPOTENCY_KEY'
            });
            return;
        }

        const cacheKey = `${this.keyPrefix}${idempotencyKey}`;

        try {
            // Redis에서 캐시된 응답 확인
            const cachedData = await this.redis.get(cacheKey);

            if (cachedData) {
                const cachedResponse: CachedResponse = JSON.parse(cachedData);

                // 캐시된 응답 반환 - 즉시 종료하여 중복 응답 방지
                return reply.code(cachedResponse.statusCode)
                    .headers(cachedResponse.headers)
                    .header('X-Idempotency-Replayed', 'true')
                    .send(cachedResponse.body);
            }

            // 새로운 요청 - 컨텍스트에 멱등성 정보 저장
            (request as any).idempotencyKey = idempotencyKey;
            (request as any).cacheKey = cacheKey;
        } catch (error) {
            // Redis 연결 실패 시 로그 남기고 요청 계속 진행
            request.log.error(`Redis error in idempotency check: ${error}`);
        }
    }

    /**
     * 응답 후처리 - 성공한 응답 캐싱
     */
    async onSend(request: FastifyRequest, reply: FastifyReply, payload: any): Promise<any> {
        const idempotencyKey = (request as any).idempotencyKey;
        const cacheKey = (request as any).cacheKey;

        if (!idempotencyKey || !cacheKey) {
            return payload;
        }

        const statusCode = reply.statusCode;

        // 성공한 응답만 캐싱 (2xx 상태 코드)
        if (statusCode >= 200 && statusCode < 300) {
            // 비동기로 캐싱 처리 (응답 흐름에 영향 없음)
            setImmediate(async () => {
                try {
                    // payload가 문자열인 경우 그대로 사용, 객체인 경우 JSON 파싱
                    let bodyData;
                    if (typeof payload === 'string') {
                        try {
                            bodyData = JSON.parse(payload);
                        } catch (e) {
                            bodyData = payload; // JSON이 아닌 경우 그대로 사용
                        }
                    } else {
                        bodyData = payload;
                    }

                    const responseData: CachedResponse = {
                        statusCode,
                        body: bodyData,
                        headers: reply.getHeaders() as Record<string, string>,
                        timestamp: Date.now()
                    };

                    // Redis에 TTL과 함께 저장
                    await this.redis.setex(cacheKey, this.ttl, JSON.stringify(responseData));
                    request.log.info(`Response cached for idempotency key: ${idempotencyKey}`);

                } catch (error) {
                    request.log.error(`Failed to cache idempotent response: ${error}`);
                }
            });
        }

        return payload;
    }

    /**
     * 멱등성 키 형식 검증
     */
    private isValidIdempotencyKey(key: string): boolean {
        // 길이 체크 (최소 10자, 최대 128자)
        if (key.length < 10 || key.length > 128) {
            return false;
        }

        // 허용된 문자만 포함 (영문, 숫자, 하이픈, 언더스코어)
        const validPattern = /^[a-zA-Z0-9\-_]+$/;
        return validPattern.test(key);
    }

    /**
     * 특정 멱등성 키의 캐시 삭제 (관리자 기능)
     */
    async deleteIdempotencyCache(idempotencyKey: string): Promise<boolean> {
        try {
            const cacheKey = `${this.keyPrefix}${idempotencyKey}`;
            const result = await this.redis.del(cacheKey);
            return result > 0;
        } catch (error) {
            console.error(`Failed to delete idempotency cache: ${error}`);
            return false;
        }
    }

    /**
     * 만료된 캐시 정리 (배치 작업용)
     */
    async cleanupExpiredCache(): Promise<number> {
        try {
            const pattern = `${this.keyPrefix}*`;
            const keys = await this.redis.keys(pattern);

            if (keys.length === 0) {
                return 0;
            }

            // TTL이 만료된 키들 찾기
            const expiredKeys: string[] = [];
            for (const key of keys) {
                const ttl = await this.redis.ttl(key); if (ttl === -1) { // TTL이 설정되지 않은 키
                    expiredKeys.push(key);
                }
            }

            if (expiredKeys.length > 0) {
                await this.redis.delMultiple(...expiredKeys);
            }

            return expiredKeys.length;
        } catch (error) {
            console.error(`Failed to cleanup expired cache: ${error}`);
            return 0;
        }
    }
}
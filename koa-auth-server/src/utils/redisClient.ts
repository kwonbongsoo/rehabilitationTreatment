import Redis from 'ioredis';

// Redis 클라이언트 생성 (환경변수로 주소 관리 권장)
export const redis = new Redis({
    host: process.env.REDIS_URL || '',
    port: parseInt(process.env.REDIS_PORT as string || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
});
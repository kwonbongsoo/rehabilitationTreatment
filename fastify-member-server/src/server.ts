import { buildApp } from './app';
import { EnvValidator } from '@ecommerce/common';

// 환경변수 검증
try {
    EnvValidator.validate({
        required: [
            'DATABASE_URL',
            'REDIS_URL',
            'REDIS_PASSWORD'
        ],
        optional: {
            'NODE_ENV': 'development',
            'PORT': '5000',
            'REDIS_PORT': '6379',
            'REDIS_DB': '0'
        },
        production: [
            'NODE_ENV'
        ]
    });

    // 추가 검증
    if (process.env.DATABASE_URL) {
        EnvValidator.validateUrl('DATABASE_URL');
    }
    if (process.env.PORT) {
        EnvValidator.validateNumber('PORT', 1, 65535);
    }
    if (process.env.REDIS_PORT) {
        EnvValidator.validateNumber('REDIS_PORT', 1, 65535);
    }
} catch (error) {
    console.error('환경변수 검증 실패:', error instanceof Error ? error.message : error);
    process.exit(1);
}

async function start() {
    const app = await buildApp();
    const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Member server is running on http://localhost:${PORT}`);
    } catch (err) {
        app.log.error(err);
        console.log(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        process.exit(1);

    }
}

start();
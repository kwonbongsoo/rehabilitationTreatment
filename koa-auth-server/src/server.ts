
import { createApp } from './app';
/**
 * 서버 시작 함수
 */
async function startServer(): Promise<void> {
    const app = createApp();
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;


    // 서버 시작
    app.listen(port, () => {
        console.log(`✨ Auth server started on port ${port}`);
        console.log(`🚀 http://localhost:${port}`);
    });

    // 종료 시그널 처리 (우아한 종료)
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    function gracefulShutdown(): void {
        console.log('🛑 Shutting down server...');
        // 여기에 리소스 정리 코드 추가
        process.exit(0);
    }
}

// 서버 시작
if (require.main === module) {
    startServer().catch((err) => {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    });
}
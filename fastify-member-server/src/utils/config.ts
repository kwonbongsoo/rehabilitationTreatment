export function validateConfig(): void {
    const requiredEnvVars = [
        'DATABASE_URL',
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
}
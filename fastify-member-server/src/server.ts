import { buildApp } from './app';

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
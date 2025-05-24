import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
    console.log(`Auth server is running on http://localhost:${PORT}`);
});
import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { setAuthRoutes } from './routes/authRoutes';

const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());

// Routes
setAuthRoutes(router);
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const PORT = process.env.AUTH_PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
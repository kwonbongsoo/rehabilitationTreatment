import { AuthService } from '../services/authService';
const authService = new AuthService();

export class AuthController {
    async register(ctx: any) {
        await authService.createUser(ctx.request.body.username, ctx.request.body.password);
        ctx.body = { message: "User registered successfully" };
    }

    async login(ctx: any) {
        const { username, password } = ctx.request.body;
        try {
            const { token } = await authService.login(username, password);
            ctx.body = { token };
        } catch (err: any) {
            ctx.status = 401;
            ctx.body = { message: err.message || 'Login failed' };
        }
    }

    async userInfo(ctx: any) {
        // 미들웨어에서 인증이 끝났으므로 바로 토큰 사용
        const token = ctx.headers['authorization'].replace('Bearer ', '');
        const userInfo = await authService.getUserInfoByToken(token);
        ctx.body = { user: userInfo };
    }
}
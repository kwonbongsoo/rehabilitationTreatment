import { AuthService } from '../services/authService';
import { Context } from 'koa';
import { LoginBody } from '../interfaces/auth';

const authService = new AuthService();

export class AuthController {
    public constructor() {
        this.login = this.login.bind(this);
        this.guestToken = this.guestToken.bind(this);
        this.verify = this.verify.bind(this);
        this.profile = this.profile.bind(this);
        this.public = this.public.bind(this);
        this.userInfo = this.userInfo.bind(this);
    }

    public async login(ctx: Context) {
        const body = ctx.request.body as LoginBody;
        try {
            const { token } = await authService.login(body.username, body.password);
            ctx.body = { token };
        } catch (err: unknown) {
            ctx.status = 401;
            ctx.body = { message: err instanceof Error ? err.message : 'Login failed' };
        }
    }

    public async guestToken(ctx: Context) {
        const token = authService.createGuestToken();
        ctx.body = { token };
    }

    public async profile(ctx: Context) {
        ctx.body = { user: ctx.state.user };
    }

    public async public(ctx: Context) {
        ctx.body = { message: '게스트/유저 모두 접근 가능', user: ctx.state.user };
    }

    public async userInfo(ctx: Context) {
        const token = authService.extractBearerToken(ctx.headers['authorization']);
        const userInfo = await authService.getUserInfoByToken(token);
        ctx.body = { user: userInfo };
    }

    public async verify(ctx: Context) {
        const token = authService.extractBearerToken(ctx.headers['authorization']);
        const secret = process.env.JWT_SECRET as string;
        const { status, message } = await authService.verifyTokenWithStatus(token, secret);
        ctx.status = status;
        ctx.body = { message };
    }
}
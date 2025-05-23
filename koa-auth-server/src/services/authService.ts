import { redis } from '../utils/redisClient';
import { generateUserToken } from '../utils/userToken';


export class AuthService {
    private users: Map<string, string> = new Map(); // In-memory user store

    public async createUser(username: string, password: string): Promise<void> {
        if (this.users.has(username)) {
            throw new Error('User already exists');
        }
        this.users.set(username, password); // Store password (in a real app, hash it)
    }

    public async validateUser(username: string, password: string): Promise<boolean> {
        const storedPassword = this.users.get(username);
        return storedPassword === password; // In a real app, compare hashed passwords
    }

    public async login(username: string, password: string): Promise<{ token: string }> {
        const isValid = await this.validateUser(username, password);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }
        // 실제 유저 정보로 대체
        const user = { id: username, role: 'user', name: username };
        const token = generateUserToken(user);

        // Redis에 토큰을 키로 유저 정보 저장 (1시간 만료)
        await redis.set(`user:token:${token}`, JSON.stringify(user), 'EX', 60 * 60);

        return { token };
    }

    public async getUserInfoByToken(token: string): Promise<any | null> {
        const userInfo = await redis.get(`user:token:${token}`);
        return userInfo ? JSON.parse(userInfo) : null;
    }
}

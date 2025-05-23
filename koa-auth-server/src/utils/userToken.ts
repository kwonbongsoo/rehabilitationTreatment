import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

export function generateUserToken(user: { id: string; role: string }) {
    const payload = {
        userId: user.id,
        role: user.role,
    };
    // 토큰 만료시간은 1시간 예시 (필요에 따라 조정)
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}
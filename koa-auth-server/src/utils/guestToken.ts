import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

export function generateGuestToken() {
    const payload = {
        role: 'guest',
        issuedAt: Date.now(),
    };
    return jwt.sign(payload, secret, { expiresIn: '1m' });
}
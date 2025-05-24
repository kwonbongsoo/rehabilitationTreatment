import jwt from 'jsonwebtoken';

export function verifyJwtToken(token: string, secret: string): boolean {
    try {
        jwt.verify(token, secret);
        return true;
    } catch {
        return false;
    }
}
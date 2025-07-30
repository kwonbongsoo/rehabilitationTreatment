import type { TokenData, AuthServiceResponse } from '../types';
import { config } from '../config';

export class AuthService {
  async issueGuestToken(): Promise<TokenData | null> {
    try {
      const requestUrl = `${config.authServiceUrl}${config.authPrefix}/guest-token`;
      const basicAuth = Buffer.from(config.authBasicKey).toString('base64');
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Bun-Proxy-Server/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Guest token API failed: ${response.status} ${response.statusText}`);
      }

      const data: AuthServiceResponse = await response.json();
      if (!data.success || !data.data?.access_token) {
        throw new Error('Invalid auth service response');
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const tokenLifetime = data.data.exp - data.data.iat;
      const elapsedTime = currentTime - data.data.iat;
      const remainingTime = Math.max(0, tokenLifetime - elapsedTime);
      const maxAge = Math.max(0, remainingTime - 60); // 1분 일찍 만료

      return {
        access_token: data.data.access_token,
        role: data.data.role || 'guest',
        maxAge,
      };
    } catch (error) {
      console.error('Failed to issue guest token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
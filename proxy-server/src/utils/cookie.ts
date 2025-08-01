import type { TokenData } from '../types';
import { config } from '../config';

export class CookieUtils {
  private isProduction(): boolean {
    return config.nodeEnv === 'production';
  }

  private getCookieOptions(maxAge: number): string {
    const options = [
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      ...(this.isProduction() ? ['Secure'] : []),
      `Max-Age=${maxAge}`,
    ];

    return options.join('; ');
  }

  setTokenCookies(response: Response, tokenData: TokenData): Response {
    const cookieOptions = this.getCookieOptions(tokenData.maxAge);

    const headers = new Headers(response.headers);
    headers.append(
      'Set-Cookie',
      `access_token=${encodeURIComponent(tokenData.access_token)}; ${cookieOptions}`,
    );
    headers.append(
      'Set-Cookie',
      `access_type=${encodeURIComponent(tokenData.role)}; ${cookieOptions}`,
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  hasAccessToken(request: Request): boolean {
    const cookieHeader = request.headers.get('cookie');
    return cookieHeader?.includes('access_token=') ?? false;
  }

  getAccessTokenFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }
}

export const cookieUtils = new CookieUtils();

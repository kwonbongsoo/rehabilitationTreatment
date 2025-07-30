import { config } from '../config';

export class LoggingUtils {
  /**
   * 요청 헤더 로깅 (디버깅용)
   */
  static logRequestHeaders(req: Request, target: string): void {
    if (!config.enableRequestLogging) return;

    console.log(`📋 Request headers being sent to ${target}:`);
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'authorization') {
        console.log(`   ${key}: Bearer ${value.substring(7, 27)}...`);
      } else if (key.toLowerCase() === 'cookie') {
        console.log(`   ${key}: ${value.substring(0, 50)}...`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
  }

  /**
   * 라우팅 로깅
   */
  static logRouting(path: string, target: string, emoji: string): void {
    console.log(`${emoji} Routing ${target} request: ${path}`);
  }

  /**
   * 토큰 관련 로깅
   */
  static logTokenStatus(hasToken: boolean, isNewToken: boolean = false): void {
    if (hasToken && !isNewToken) {
      console.log('🔑 Found existing access token');
    } else if (hasToken && isNewToken) {
      console.log('Guest token issued successfully');
    } else if (!hasToken && isNewToken) {
      console.log('Failed to issue guest token');
    } else {
      console.log('🔑 No access token found, issuing guest token...');
    }
  }
}
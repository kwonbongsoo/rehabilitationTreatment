import { config } from '../config';
import { ProxyRequestError, createErrorContext } from '../middleware/errorHandler';

export abstract class BaseProxyHandler {
  protected abstract getTargetName(): string;

  protected async proxyRequest(req: Request, targetUrl: string): Promise<Response> {
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      });

      if (config.enableRequestLogging) {
        // console.log(
        //   `✅ ${this.getTargetName()} response: ${response.status} ${response.statusText}`,
        // );
      }

      return this.createProxyResponse(response);
    } catch (error) {
      console.error(`${this.getTargetName()} proxy error:`, error);
      const context = createErrorContext(req);
      throw new ProxyRequestError(
        `Failed to connect to ${this.getTargetName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context,
        error instanceof TypeError && error.message.includes('fetch') ? 503 : 502
      );
    }
  }

  protected createProxyResponse(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.set('X-Proxy-Server', 'bun-proxy');
    headers.set('X-Proxy-Target', this.getTargetName().toLowerCase());
    headers.delete('content-encoding');
    headers.delete('content-length');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

}

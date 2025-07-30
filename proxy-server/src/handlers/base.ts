import { config } from '../config';

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
      return this.createErrorResponse();
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

  protected createErrorResponse(): Response {
    return new Response(
      JSON.stringify({
        error: `${this.getTargetName()} Proxy Error`,
        message: `Failed to connect to ${this.getTargetName()}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Error': this.getTargetName().toLowerCase(),
        },
      },
    );
  }
}
